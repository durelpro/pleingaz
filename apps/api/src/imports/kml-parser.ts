import * as fs from 'fs';
import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';
import { RawPlacemark } from './types';

/**
 * Parser KML/KMZ robuste supportant les archives Google My Maps
 */
export class KmlParser {
  private static readonly MAX_UNCOMPRESSED_SIZE_BYTES = 25 * 1024 * 1024; // 25 Mo (Protection zip-bomb)

  /**
   * Parse un fichier KML ou KMZ depuis un chemin de fichier ou un Buffer
   */
  static parse(filePathOrBuffer: string | Buffer): RawPlacemark[] {
    let kmlContent: string;

    if (typeof filePathOrBuffer === 'string') {
      if (filePathOrBuffer.toLowerCase().endsWith('.kmz')) {
        kmlContent = this.extractKmlFromKmzBuffer(
          fs.readFileSync(filePathOrBuffer),
        );
      } else {
        kmlContent = fs.readFileSync(filePathOrBuffer, 'utf-8');
      }
    } else {
      // Détection magique zip (PK..)
      if (
        filePathOrBuffer.length > 4 &&
        filePathOrBuffer[0] === 0x50 &&
        filePathOrBuffer[1] === 0x4b
      ) {
        kmlContent = this.extractKmlFromKmzBuffer(filePathOrBuffer);
      } else {
        kmlContent = filePathOrBuffer.toString('utf-8');
      }
    }

    return this.parseKmlXml(kmlContent);
  }

  /**
   * Extrait doc.kml d'un Buffer KMZ sécurisé
   */
  private static extractKmlFromKmzBuffer(buffer: Buffer): string {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    let totalSize = 0;
    let docKmlEntry: AdmZip.IZipEntry | undefined;

    for (const entry of zipEntries) {
      totalSize += entry.header.size;
      if (totalSize > this.MAX_UNCOMPRESSED_SIZE_BYTES) {
        throw new Error(
          'Dépassement de la taille maximale autorisée (Protection anti-zip-bomb)',
        );
      }
      if (entry.entryName.toLowerCase().endsWith('.kml')) {
        docKmlEntry = entry;
      }
    }

    if (!docKmlEntry) {
      throw new Error("L'archive KMZ ne contient aucun fichier .kml valide");
    }

    return docKmlEntry.getData().toString('utf-8');
  }

  /**
   * Parse le contenu XML KML
   */
  private static parseKmlXml(xmlContent: string): RawPlacemark[] {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseTagValue: true,
      trimValues: true,
      cdataPropName: '__cdata',
    });

    const parsed = parser.parse(xmlContent);
    const placemarks: RawPlacemark[] = [];

    // Navigation récursive pour extraire tous les Placemarks quel que soit le niveau de Folder
    this.extractPlacemarksRecursive(parsed, undefined, placemarks);

    return placemarks;
  }

  private static extractPlacemarksRecursive(
    node: any,
    currentFolderName: string | undefined,
    results: RawPlacemark[],
  ): void {
    if (!node || typeof node !== 'object') return;

    if (node.Folder) {
      const folders = Array.isArray(node.Folder) ? node.Folder : [node.Folder];
      for (const folder of folders) {
        const folderName = folder.name || currentFolderName;
        this.extractPlacemarksRecursive(folder, folderName, results);
      }
    }

    if (node.Document) {
      this.extractPlacemarksRecursive(
        node.Document,
        currentFolderName,
        results,
      );
    }

    if (node.kml) {
      this.extractPlacemarksRecursive(node.kml, currentFolderName, results);
    }

    if (node.Placemark) {
      const pms = Array.isArray(node.Placemark)
        ? node.Placemark
        : [node.Placemark];
      for (const pm of pms) {
        const parsedPm = this.convertNodeToPlacemark(pm, currentFolderName);
        if (parsedPm) {
          results.push(parsedPm);
        }
      }
    }
  }

  private static convertNodeToPlacemark(
    pm: any,
    folderName?: string,
  ): RawPlacemark | null {
    const name = pm.name ? String(pm.name).trim() : '';

    let description: string | undefined;
    if (pm.description) {
      if (typeof pm.description === 'string') {
        description = pm.description;
      } else if (pm.description.__cdata) {
        description = pm.description.__cdata;
      } else if (pm.description['#text']) {
        description = pm.description['#text'];
      }
    }

    // Coordonnées Point
    let coordinates:
      | { longitude: number; latitude: number; altitude?: number }
      | undefined;
    if (pm.Point && pm.Point.coordinates) {
      const coordStr = String(pm.Point.coordinates).trim();
      // Format WGS84 standard KML: longitude,latitude[,altitude]
      const parts = coordStr.split(',').map((p) => parseFloat(p.trim()));
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        coordinates = {
          longitude: parts[0],
          latitude: parts[1],
          altitude: parts.length > 2 ? parts[2] : undefined,
        };
      }
    }

    if (!coordinates) {
      coordinates = { longitude: 0, latitude: 0 };
    }

    // ExtendedData
    const extendedData: Record<string, string> = {};
    if (pm.ExtendedData && pm.ExtendedData.Data) {
      const dataArr = Array.isArray(pm.ExtendedData.Data)
        ? pm.ExtendedData.Data
        : [pm.ExtendedData.Data];
      for (const d of dataArr) {
        if (d['@_name'] && d.value !== undefined) {
          extendedData[d['@_name']] = String(d.value);
        }
      }
    }

    return {
      id: pm['@_id'],
      name,
      description,
      coordinates,
      folderName,
      extendedData,
    };
  }
}
