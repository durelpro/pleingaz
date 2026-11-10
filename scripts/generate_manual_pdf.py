import os
import sys

# Ensure reportlab is loaded from workspace
sys.path.insert(0, '/home/durel/pleingaz/packages/reportlab-lib')

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# Palette PLEINGAZ
COLOR_PRIMARY = colors.HexColor('#DC2626')      # Rouge Pleingaz
COLOR_PRIMARY_DARK = colors.HexColor('#991B1B') # Rouge foncé
COLOR_SECONDARY = colors.HexColor('#D97706')    # Jaune Flamme ambré
COLOR_DARK = colors.HexColor('#111827')         # Texte foncé
COLOR_MUTED = colors.HexColor('#4B5563')        # Texte secondaire
COLOR_LIGHT_BG = colors.HexColor('#F9FAFB')     # Fond encarts légers
COLOR_CARD_BORDER = colors.HexColor('#E5E7EB')  # Bordures fines
COLOR_SUCCESS = colors.HexColor('#059669')      # Vert succès
COLOR_WARNING = colors.HexColor('#D97706')      # Orange alerte
COLOR_WHITE = colors.HexColor('#FFFFFF')

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Ne pas afficher header/footer sur la page de garde
            return

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(COLOR_MUTED)

        # En-tête
        self.drawString(20 * mm, 285 * mm, "PLEINGAZ – Digital Distribution Network")
        self.drawRightString(190 * mm, 285 * mm, "Guide d'Utilisation & Manuel Opérationnel")
        self.setStrokeColor(COLOR_PRIMARY)
        self.setLineWidth(0.8)
        self.line(20 * mm, 282 * mm, 190 * mm, 282 * mm)

        # Pied de page
        self.setStrokeColor(COLOR_CARD_BORDER)
        self.setLineWidth(0.5)
        self.line(20 * mm, 15 * mm, 190 * mm, 15 * mm)
        self.drawString(20 * mm, 11 * mm, "Édition Officielle v1.2.1 • Réf. CR-003 • Confidentiel INFOTECH S.A. / PLEINGAZ")
        self.drawRightString(190 * mm, 11 * mm, f"Page {self._pageNumber} sur {page_count}")
        self.restoreState()


def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=22 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()

    # Styles personnalisés
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=COLOR_PRIMARY,
        alignment=0,
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=COLOR_MUTED,
        alignment=0,
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=COLOR_PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=COLOR_DARK,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )

    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=COLOR_SECONDARY,
        spaceBefore=6,
        spaceAfter=2,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=COLOR_DARK,
        spaceAfter=4,
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=COLOR_DARK,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3,
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=COLOR_DARK,
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=COLOR_WHITE,
        alignment=1,
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=COLOR_DARK,
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=COLOR_DARK,
    )

    story = []

    # =========================================================================
    # PAGE 1 : PAGE DE GARDE
    # =========================================================================
    story.append(Spacer(1, 20 * mm))
    
    # Badge officiel
    badge_data = [[
        Paragraph("<font color='#DC2626'><b>RÉSEAU NUMÉRIQUE NATIONAL DE DISTRIBUTION DE GAZ DOMESTIQUE</b></font>", table_cell_bold)
    ]]
    badge_table = Table(badge_data, colWidths=[174 * mm])
    badge_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEE2E2')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#FCA5A5')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(badge_table)
    story.append(Spacer(1, 8 * mm))

    story.append(Paragraph("PLEINGAZ Cameroun", title_style))
    story.append(Paragraph("Guide d'Utilisation & Manuel Opérationnel Exhaustif", ParagraphStyle(
        'MainHeading', parent=title_style, fontSize=20, leading=24, textColor=COLOR_DARK
    )))
    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph("Architecture, Rôles Opérationnels, Gestion des Quotas & Sécurité d'Exploitation", subtitle_style))
    
    story.append(Spacer(1, 8 * mm))
    story.append(HRFlowable(width="100%", thickness=2, color=COLOR_PRIMARY, spaceAfter=15))

    # Tableau méta-données
    meta_data = [
        [Paragraph("<b>Version du Document</b>", table_cell_bold), Paragraph("v1.2.1-CR003 (Mise à jour post-recette)", table_cell_style)],
        [Paragraph("<b>Cadre Réglementaire</b>", table_cell_bold), Paragraph("Directives Souveraines CR-001 & CR-003 (D-11 à D-18)", table_cell_style)],
        [Paragraph("<b>Portée Applicative</b>", table_cell_bold), Paragraph("Frontend Next.js 16 (PWA Web) & API NestJS PostgreSQL/PostGIS", table_cell_style)],
        [Paragraph("<b>Numéros Officiels Réseau</b>", table_cell_bold), Paragraph("Orange Money : <b>657 696 567</b> | MTN MoMo : <b>675 119 989</b>", table_cell_style)],
        [Paragraph("<b>Entité Émettrice</b>", table_cell_bold), Paragraph("INFOTECH S.A. / Direction des Systèmes d'Information PLEINGAZ", table_cell_style)],
        [Paragraph("<b>Statut de Validation</b>", table_cell_bold), Paragraph("<font color='#059669'><b>HOMOLOGUÉ & REÇU À 100% (136/136 TESTS PASSANTS)</b></font>", table_cell_style)],
    ]
    meta_table = Table(meta_data, colWidths=[55 * mm, 119 * mm])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), COLOR_LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 0.5, COLOR_CARD_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, COLOR_CARD_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 12 * mm))

    # Sommaire exécutif
    story.append(Paragraph("<b>SOMMAIRE DU GUIDE</b>", h2_style))
    sommaire_data = [
        [Paragraph("<b>Section 1</b>", table_cell_bold), Paragraph("Vision du Système & les 8 Décisions Souveraines (D-11 à D-18)", table_cell_style)],
        [Paragraph("<b>Section 2</b>", table_cell_bold), Paragraph("Espace Client Acheteur : Connexion WhatsApp, Quota 5 Bouteilles & Commande", table_cell_style)],
        [Paragraph("<b>Section 3</b>", table_cell_bold), Paragraph("Espace Distributeur Agréé : Stock Qualitatif, KYC 3 Pièces & Vente Comptoir", table_cell_style)],
        [Paragraph("<b>Section 4</b>", table_cell_bold), Paragraph("Espace Livreur Partenaire : Terminal PWA, Double Confirmation & Caisse 50k", table_cell_style)],
        [Paragraph("<b>Section 5</b>", table_cell_bold), Paragraph("Espace Gestionnaire de Compte : Rôle ACCOUNT_MANAGER & Maker-Checker", table_cell_style)],
        [Paragraph("<b>Section 6</b>", table_cell_bold), Paragraph("Espace Administrateur : Superviseur, Grand Livre & Centre des 15 Rapports", table_cell_style)],
        [Paragraph("<b>Section 7</b>", table_cell_bold), Paragraph("Matrice des URLs, Protocoles d'Urgence (Fuites) & Sécurité Cyber", table_cell_style)],
    ]
    sommaire_table = Table(sommaire_data, colWidths=[28 * mm, 146 * mm])
    sommaire_table.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(sommaire_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 2 : SECTION 1 — VISION ET DÉCISIONS CR-003
    # =========================================================================
    story.append(Paragraph("Section 1 : Vision du Système & Décisions Souveraines CR-003", h1_style))
    story.append(Paragraph(
        "La plateforme <b>PLEINGAZ</b> est le réseau numérique officiel de distribution de gaz domestique au Cameroun. "
        "Elle transforme l'ancien site vitrine en une infrastructure transactionnelle de haute sécurité garantissant la disponibilité réelle, "
        "le respect des tarifs officiels et la traçabilité comptable intégrale.",
        body_style
    ))
    story.append(Spacer(1, 3 * mm))

    story.append(Paragraph("Les 8 Décisions Souveraines (D-11 à D-18)", h2_style))

    decisions_table_data = [
        [
            Paragraph("<b>Réf.</b>", table_header_style),
            Paragraph("<b>Décision & Principe Métier</b>", table_header_style),
            Paragraph("<b>Implémentation Conforme</b>", table_header_style),
            Paragraph("<b>Règle de Contrôle</b>", table_header_style)
        ],
        [
            Paragraph("<b>D-11</b>", table_cell_bold),
            Paragraph("<b>Espaces Séparés & Aucune Trace</b><br/>Un numéro = un seul portail. Suppression totale de sélecteur de profil en session.", table_cell_style),
            Paragraph("Routes isolées (/acheteur, /distributor, /delivery, /admin). <code>PortalAudienceGuard</code> actif.", table_cell_style),
            Paragraph("Réponse <b>HTTP 404</b> systématique hors audience.", table_cell_style)
        ],
        [
            Paragraph("<b>D-12</b>", table_cell_bold),
            Paragraph("<b>Preuve Entrante WhatsApp</b><br/>Inscription et login gratuits via défi <code>PG-XXXX</code>. Règle des 2 numéros distincts (voix et data).", table_cell_style),
            Paragraph("Modèle <code>VerificationChallenge</code>. Message éphémère client vers compte vérifié wa.me/.", table_cell_style),
            Paragraph("<b>Zéro coût SMS sortant</b> pour PLEINGAZ.", table_cell_style)
        ],
        [
            Paragraph("<b>D-13</b>", table_cell_bold),
            Paragraph("<b>Sanctuarisation Visuelle</b><br/>Conservation de la charte de marque historique (Rouge #DC2626, Montserrat, Jaune Flamme).", table_cell_style),
            Paragraph("Design system unifié, dark-mode accessible WCAG AA, interfaces tactiles plein écran.", table_cell_style),
            Paragraph("Performance mobile-first sur réseaux 3G.", table_cell_style)
        ],
        [
            Paragraph("<b>D-14</b>", table_cell_bold),
            Paragraph("<b>Quota Ménage 5 Bouteilles</b><br/>Loi anti-spéculation : maximum 5 recharges par période glissante de 30 jours par ménage.", table_cell_style),
            Paragraph("Jauge visuelle à 5 crans (<code>QuotaGauge</code>). Contrôle atomique bloquant à la commande.", table_cell_style),
            Paragraph("Rejet immédiat si cumul >= 5 bouteilles.", table_cell_style)
        ],
        [
            Paragraph("<b>D-15</b>", table_cell_bold),
            Paragraph("<b>Gestionnaire de Compte</b><br/>10e rôle RBAC. Zéro usurpation (\"voir comme\"). Dossiers formels d'assistance audités.", table_cell_style),
            Paragraph("Modèle <code>AccountCase</code>. Protocole Maker-Checker obligatoire avec superviseur.", table_cell_style),
            Paragraph("Rejet absolu si <code>adminId == agentId</code>.", table_cell_style)
        ],
        [
            Paragraph("<b>D-16</b>", table_cell_bold),
            Paragraph("<b>Vente Directe au Comptoir</b><br/>Enregistrement des achats physiques en boutique avec numéro acheteur et décompte quota.", table_cell_style),
            Paragraph("Terminal <code>/distributor/counter</code> avec reçu officiel <code>RCP-CS-...</code> et écriture comptable.", table_cell_style),
            Paragraph("Contrôle du quota préalable obligatoire.", table_cell_style)
        ],
        [
            Paragraph("<b>D-17</b>", table_cell_bold),
            Paragraph("<b>Double Confirmation Livraison</b><br/>Clôture en 2 paliers : Livreur (\"J'ai livré\") puis Acheteur (\"J'ai reçu\") ou code PIN 4 chiffres.", table_cell_style),
            Paragraph("Composant <code>DoubleConfirmationCard</code>, tarif coursier fixe homologué à 1 000 FCFA.", table_cell_style),
            Paragraph("Clôture automatique après 2h sans contestation.", table_cell_style)
        ],
        [
            Paragraph("<b>D-18</b>", table_cell_bold),
            Paragraph("<b>Rubrique Infos & Acquittement</b><br/>Diffusion d'annonces administratives et alertes sécurité ciblées par zone et profil.", table_cell_style),
            Paragraph("Modèles <code>InfoNotice</code> et <code>InfoNoticeRead</code>, composant <code>InfoNoticeBanner</code>.", table_cell_style),
            Paragraph("Bouton obligatoire <b>\"J'ai compris\"</b> horodaté.", table_cell_style)
        ],
    ]
    decisions_table = Table(decisions_table_data, colWidths=[14 * mm, 54 * mm, 60 * mm, 46 * mm])
    decisions_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_PRIMARY),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_CARD_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [COLOR_WHITE, COLOR_LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(decisions_table)

    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph("Tarifs Officiels Homologués (Modèle Économique Non Négociable)", h2_style))
    story.append(Paragraph(
        "Conformément à la réglementation nationale et au barème CSPH en vigueur :<br/>"
        "• <b>Recharge de gaz standard (12.5 kg)</b> : <b>6 500 FCFA</b> (prix public garanti, aucune majoration autorisée).<br/>"
        "• <b>Forfait de livraison urbaine coursier</b> : <b>1 000 FCFA</b> fixe par course (ADR D17).<br/>"
        "• <b>Total commande livrée à domicile</b> : <b>7 500 FCFA</b>.<br/>"
        "• <b>Comptabilité Grand Livre (D-06)</b> : Toute transaction génère des écritures équilibrées en partie double (Comptes 1010 Trésorerie, 7010 Ventes gaz, 4010 Dette livreur).",
        body_style
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3 : SECTION 2 — ESPACE ACHETEUR
    # =========================================================================
    story.append(Paragraph("Section 2 : Guide de l'Espace Client Acheteur", h1_style))
    story.append(Paragraph(
        "L'espace Acheteur ([/acheteur](file:///home/durel/pleingaz/apps/web/src/app/acheteur/page.tsx) ou [/account](file:///home/durel/pleingaz/apps/web/src/app/account/page.tsx)) "
        "est conçu pour offrir une simplicité maximale au consommateur ménager, avec ou sans maîtrise de l'outil informatique.",
        body_style
    ))

    story.append(Paragraph("1. Inscription Gratuite par Preuve Entrante WhatsApp (D-12)", h2_style))
    story.append(Paragraph(
        "• L'acheteur saisit son <b>numéro WhatsApp principal</b> (qui lui servira d'identifiant de connexion) et son nom complet.<br/>"
        "• <b>Règle des Deux Numéros (D-12.3)</b> : Le client doit obligatoirement renseigner un <b>numéro d'appel voix distinct</b>. "
        "Cette règle garantit que le livreur ou le service client peut contacter le client en cas de forfait data épuisé ou de coupure Internet.<br/>"
        "• Le système génère un défi éphémère à 4 chiffres préfixé <code>PG-XXXX</code> valable 10 minutes.<br/>"
        "• Le client clique sur <b>\"Continuer vers WhatsApp\"</b> (ouvre l'application WhatsApp vers le numéro officiel PLEINGAZ avec le message prérempli) et envoie son code. "
        "Le webhook serveur valide l'identité instantanément et active le compte à 0 FCFA de frais pour PLEINGAZ.",
        body_style
    ))

    story.append(Paragraph("2. Recherche Géolocalisée des 71 Points de Vente Agréés", h2_style))
    story.append(Paragraph(
        "• L'acheteur clique sur <b>\"Où trouver du gaz ?\"</b> ou <b>\"J'ai besoin de gaz maintenant\"</b>.<br/>"
        "• <b>Géolocalisation au Clic (D-02)</b> : Aucune géolocalisation n'est déclenchée sans accord explicite. "
        "L'acheteur peut soit autoriser le GPS de son smartphone, soit choisir manuellement sa ville, son quartier ou un repère visuel familier.<br/>"
        "• La plateforme calcule par formule de Haversine les dépôts officiels approvisionnés les plus proches parmi les <b>71 points agréés</b> du réseau national.<br/>"
        "• <b>Fraîcheur du Stock Qualitatif (D-03)</b> : Pour chaque distributeur, l'état qualitatif du stock est affiché : "
        "<font color='#059669'><b>BON</b></font>, <font color='#D97706'><b>MOYEN</b></font>, <font color='#DC2626'><b>FAIBLE</b></font> ou <font color='#991B1B'><b>RUPTURE</b></font>, "
        "accompagné de l'horodatage précis de la dernière confirmation.",
        body_style
    ))

    story.append(Paragraph("3. Commande en Ligne & Règlement Mobile Money Direct", h2_style))
    story.append(Paragraph(
        "• <b>Vérification d'accès obligatoire (D-11 & D-14)</b> : Pour commander sur [/checkout](file:///home/durel/pleingaz/apps/web/src/app/checkout/page.tsx), "
        "le client doit impérativement être connecté afin de garantir la traçabilité administrative.<br/>"
        "• <b>Repère Visuel Obligatoire</b> : Le client doit renseigner un repère précis (ex: <i>« En face de la Pharmacie du Rail, portail noir »</i>).<br/>"
        "• <b>Minuteur de Réservation 15 Minutes</b> : Dès l'initiation de la commande, le stock est réservé pendant 15 minutes. "
        "Un compte à rebours défile à l'écran. En cas de dépassement, la commande passe en pause (<code>PAUSED</code>) pour libérer le stock.<br/>"
        "• <b>Transfert Direct Mobile Money</b> : Le client effectue son transfert vers les numéros officiels de la plateforme :<br/>"
        "  - <b>Orange Money</b> : <code>657 696 567</code> (Compte Particulier PLEINGAZ)<br/>"
        "  - <b>MTN Mobile Money</b> : <code>675 119 989</code> (Compte Particulier PLEINGAZ)<br/>"
        "• Le client colle la référence de transaction SMS et valide son achat.",
        body_style
    ))

    story.append(Paragraph("4. Jauge Quota 5 Bouteilles & Réassort Express 1-Clic", h2_style))
    story.append(Paragraph(
        "• <b>Composant QuotaGauge (D-14)</b> : Le tableau de bord affiche une jauge dynamique à 5 crans segmentés. "
        "Tout achat en ligne ou au comptoir incrémente la jauge. Au 5e cran, le système bloque tout nouvel achat jusqu'à expiration de la fenêtre de 30 jours glissants.<br/>"
        "• <b>Bouton Réassort 1-Clic</b> : Permet de recommander en 1 tap la bouteille habituelle de 12.5 kg auprès de son distributeur favori.<br/>"
        "• <b>Bouton d'Urgence Fuite de Gaz</b> : Bouton rouge d'action immédiate affichant les numéros d'urgence sapeurs-pompiers (118 / 18) et les consignes de sécurité vitales.",
        body_style
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4 : SECTION 3 — ESPACE DISTRIBUTEUR AGRÉÉ
    # =========================================================================
    story.append(Paragraph("Section 3 : Guide de l'Espace Distributeur Agréé", h1_style))
    story.append(Paragraph(
        "L'espace Distributeur ([/distributor/inventory](file:///home/durel/pleingaz/apps/web/src/app/distributor/inventory/page.tsx) et [/distributor/counter](file:///home/durel/pleingaz/apps/web/src/app/distributor/counter/page.tsx)) "
        "permet aux gérants de points de vente physiques d'administrer leur stock et d'enregistrer leurs ventes en boutique.",
        body_style
    ))

    story.append(Paragraph("1. Inscription & Dossier KYC Simplifié à 3 Pièces (D-04)", h2_style))
    story.append(Paragraph(
        "Conformément à la décision souveraine D-04, les exigences administratives lourdes (RC, patente, NIU) sont supprimées au profit de <b>strictement 3 pièces justificatives</b> :<br/>"
        "1. <b>Pièce d'Identité Officielle</b> (CNI ou passeport recto et verso).<br/>"
        "2. <b>Photo Portrait Récent</b> du gérant.<br/>"
        "3. <b>Photo de la Façade Extérieure</b> du point de vente montrant l'emplacement physique.<br/>"
        "• <b>Confidentialité & Stockage Privé</b> : Les pièces d'identité sont stockées dans un bucket sécurisé avec URLs signées temporaires (15 min) "
        "réservées aux administrateurs. Seule la photo de boutique devient publique après homologation.",
        body_style
    ))

    story.append(Paragraph("2. Actualisation du Stock Qualitatif en 1-Clic (D-03)", h2_style))
    story.append(Paragraph(
        "• Les distributeurs ne gèrent pas d'inventaire numérique complexe ni de prix libres (les prix sont nationaux et fixés centralement).<br/>"
        "• Sur leur tableau de bord, ils disposent de 4 boutons tactiles larges pour déclarer l'état de leur réserve de bouteilles 12.5 kg : "
        "<b>BON</b> (vert), <b>MOYEN</b> (orange), <b>FAIBLE</b> (rouge clair), <b>RUPTURE</b> (gris/rouge foncé).<br/>"
        "• Un bouton <b>\"Confirmer l'exactitude du stock\"</b> permet en 1 tap de réactualiser l'horodatage public, garantissant aux clients la fraîcheur de l'information.",
        body_style
    ))

    story.append(Paragraph("3. Terminal de Vente Directe au Comptoir (D-16)", h2_style))
    story.append(Paragraph(
        "Le module [/distributor/counter](file:///home/durel/pleingaz/apps/web/src/app/distributor/counter/page.tsx) est dédié aux clients qui se présentent physiquement au dépôt :<br/>"
        "• <b>Saisie du numéro acheteur</b> : Le gérant tape le numéro de téléphone du client (ex: <code>699 11 22 33</code>).<br/>"
        "• <b>Interrogation temps réel du quota (D-14)</b> : Le terminal interroge l'API NestJS. "
        "Si le client a déjà atteint son quota de 5 bouteilles sur 30 jours, <b>la transaction est bloquée avec message d'interdiction légale</b>.<br/>"
        "• <b>Règlement</b> : Le gérant sélectionne le mode de paiement (Espèces ou Mobile Money).<br/>"
        "• <b>Émission du Reçu Fiscal</b> : Le système génère instantanément un reçu numéroté <code>RCP-CS-YYYYMMDD-XXXX</code> avec décompte automatique du quota "
        "et enregistrement dans le Grand Livre comptable PLEINGAZ.",
        body_style
    ))

    story.append(Paragraph("4. Supervision de la Flotte de Livreurs Rattachés", h2_style))
    story.append(Paragraph(
        "• Le distributeur peut déclarer et lier ses livreurs de proximité (nom, téléphone, type de véhicule : moto ou tricycle).<br/>"
        "• Il visualise en direct l'état de service de chaque livreur (En ligne / En livraison / En pause).",
        body_style
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 5 : SECTION 4 — ESPACE LIVREUR PARTENAIRE
    # =========================================================================
    story.append(Paragraph("Section 4 : Guide de l'Espace Livreur Partenaire", h1_style))
    story.append(Paragraph(
        "L'application Livreur ([/delivery](file:///home/durel/pleingaz/apps/web/src/app/delivery/page.tsx)) est une PWA ultra-légère optimisée "
        "pour smartphone Android en conditions de mobilité terrain et de connectivité 3G fluctuante.",
        body_style
    ))

    story.append(Paragraph("1. Réception de la Course & Navigation par Repère Visuel", h2_style))
    story.append(Paragraph(
        "• Dès attribution d'une commande par le système, le livreur reçoit la fiche de mission avec :<br/>"
        "  - Le point de départ : nom du distributeur et adresse de retrait de la bouteille scellée.<br/>"
        "  - Le point d'arrivée : nom de la cliente, quartier, et <b>le repère visuel précis obligatoire</b> "
        "(ex: <i>« En face de la Pharmacie du Rail, portail noir barbelé »</i>).<br/>"
        "• Deux boutons d'action rapide à un doigt permettent de joindre la cliente sans quitter l'écran : "
        "<b>Appel GSM Voix direct</b> (sur le numéro d'appel de secours) ou <b>Message WhatsApp direct</b>.",
        body_style
    ))

    story.append(Paragraph("2. Double Confirmation Contradictoire de Livraison (D-17)", h2_style))
    story.append(Paragraph(
        "Pour éliminer tout litige de remise ou contestation de mauvaise foi, la clôture s'effectue en deux temps contradictoires :<br/>"
        "• <b>Palier 1 : Déclaration Livreur</b> : Arrivé sur place, le coursier clique sur <b>\"J'ai livré la bouteille\"</b>. "
        "La commande passe au statut intermédiaire <code>DELIVERED_PENDING_CONFIRMATION</code>.<br/>"
        "• <b>Palier 2 : Confirmation Acheteur</b> : La cliente reçoit une notification sur son tableau de bord et clique sur <b>\"J'ai bien reçu ma bouteille\"</b>.<br/>"
        "• <b>Clôture Directe par Code PIN 4 chiffres (D-09)</b> : Pour une clôture immédiate en direct sans attendre l'écran de la cliente, "
        "le livreur demande et saisit le <b>Code Secret à 4 chiffres</b> remis par la cliente. Le code est vérifié par hachage cryptographique SHA-256 côté serveur.<br/>"
        "• <b>Forfait Coursier Fixe</b> : Chaque course validée crédite automatiquement le compte du livreur de <b>1 000 FCFA net</b>.",
        body_style
    ))

    story.append(Paragraph("3. Gestion des Espèces (Cash on Delivery) & Plafond 50 000 FCFA", h2_style))
    story.append(Paragraph(
        "• <b>Dette Envers PLEINGAZ (ADR D9 & D10)</b> : Lorsqu'une commande est payée en espèces à la livraison (6 500 FCFA), "
        "les fonds encaissés par le livreur constituent une dette liquide envers la plateforme.<br/>"
        "• <b>Jauge de Sécurité Caisse</b> : Le terminal livreur affiche une jauge en temps réel du cash en main.<br/>"
        "• <b>Blocage Automatique au Plafond</b> : Dès que la caisse du coursier atteint <b>50 000 FCFA</b>, "
        "le système bloque automatiquement toute attribution de nouvelle course. "
        "Le livreur doit obligatoirement reverser les fonds via transfert Mobile Money ou auprès d'un dépôt central pour débloquer son compte.",
        body_style
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 6 : SECTION 5 — GESTIONNAIRE DE COMPTE (D-15)
    # =========================================================================
    story.append(Paragraph("Section 5 : Guide du Gestionnaire de Compte (D-15)", h1_style))
    story.append(Paragraph(
        "Le 10e rôle du modèle RBAC, <code>ACCOUNT_MANAGER</code>, est dédié aux agents de support client et de relation distributeurs. "
        "Son interface dédiée est accessible sur [/gestionnaire](file:///home/durel/pleingaz/apps/web/src/app/gestionnaire/page.tsx) "
        "et [/admin/account-cases](file:///home/durel/pleingaz/apps/web/src/app/admin/account-cases/page.tsx).",
        body_style
    ))

    story.append(Paragraph("1. Principes d'Étanchéité et Interdiction d'Usurpation", h2_style))
    story.append(Paragraph(
        "• <b>Zéro Usurpation (\"Voir comme\")</b> : Conformément à la décision D-15.1, aucune fonctionnalité d'impersonation "
        "permettant à un agent de se faire passer pour un client ou un distributeur n'existe dans le système.<br/>"
        "• <b>Masquage par Défaut des Données Personnelles</b> : Les numéros de téléphone et adresses sensibles sont masqués par défaut (ex: <code>+237 699 ••• •33</code>). "
        "Tout démasquage exige un clic explicite avec motif légitime, consigné de manière immuable dans l'<code>AuditLog</code>.",
        body_style
    ))

    story.append(Paragraph("2. Procédure Formelle des Dossiers d'Assistance (AccountCase)", h2_style))
    story.append(Paragraph(
        "Toute modification sensible de compte (changement de numéro WhatsApp suite à perte de téléphone, déblocage de compte après tentatives suspectes, contestation de quota) "
        "exige impérativement l'ouverture d'un dossier formel <code>AccountCase</code> :<br/>"
        "1. L'agent sélectionne le type de dossier (<code>PHONE_CHANGE</code>, <code>UNLOCK_ACCOUNT</code>, <code>QUOTA_RESET</code>, <code>DISPUTE_RESOLUTION</code>).<br/>"
        "2. L'agent renseigne l'ancien identifiant, le nouvel identifiant proposé, le motif détaillé et téléverse les pièces d'investigation (copie CNI, journal d'appel de contrôle).<br/>"
        "3. Le dossier passe au statut <code>PENDING_REVIEW</code>.",
        body_style
    ))

    story.append(Paragraph("3. Séparation Stricte des Tâches : Règle Maker-Checker Invariant", h2_style))
    story.append(Paragraph(
        "• <b>Assertion Souveraine Inviolable (D-15.2)</b> : L'agent créateur du dossier (Maker) ne peut <b>en aucun cas</b> approuver son propre dossier. "
        "Le serveur NestJS lève une <code>ForbiddenException</code> fatale si <code>adminId === agentId</code>.<br/>"
        "• <b>Approbation Superviseur (Checker)</b> : Un administrateur distinct habilité examine les pièces justificatives et valide la mutation.<br/>"
        "• <b>Exécution Atomique</b> : Dès validation, le numéro de l'utilisateur est mis à jour, les sessions actives sont invalidées par sécurité, "
        "et une notification d'audit est enregistrée avec les signatures cryptographiques des deux intervenants.",
        body_style
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 7 : SECTION 6 — ESPACE ADMINISTRATEUR & CONTROL CENTER
    # =========================================================================
    story.append(Paragraph("Section 6 : Espace Administrateur & Control Center", h1_style))
    story.append(Paragraph(
        "Le Control Center ([/admin/dashboard](file:///home/durel/pleingaz/apps/web/src/app/admin/dashboard/page.tsx)) centralise la gouvernance stratégique, "
        "financière et opérationnelle du réseau national PLEINGAZ.",
        body_style
    ))

    story.append(Paragraph("1. Homologation Tarifaire Maker-Checker (D-01 & D-06)", h2_style))
    story.append(Paragraph(
        "• Les prix du gaz et des consignes sont <b>strictement nationaux</b> et ne peuvent être modifiés par aucun intermédiaire local.<br/>"
        "• Toute proposition de révision tarifaire suit le protocole Maker-Checker : un premier administrateur soumet le nouveau barème dans <code>ProductPrice</code>, "
        "qui reste inactif tant qu'un second administrateur distinct ne l'a pas formellement contre-signé.",
        body_style
    ))

    story.append(Paragraph("2. Diffusion des Annonces Officielles \"Infos\" (D-18)", h2_style))
    story.append(Paragraph(
        "• Les superviseurs peuvent émettre des annonces officielles via [/admin/notifications](file:///home/durel/pleingaz/apps/web/src/app/admin/notifications/page.tsx).<br/>"
        "• <b>Ciblage Fin</b> : Par profil (Acheteurs, Distributeurs, Livreurs ou Tous) et par zone géographique (Douala, Yaoundé, etc.).<br/>"
        "• <b>Niveaux de Criticité</b> : <code>INFO</code> (bleu), <code>WARNING</code> (orange) ou <code>CRITICAL</code> (rouge).<br/>"
        "• <b>Registre d'Émargement</b> : Le Control Center suit en direct le pourcentage d'utilisateurs ayant cliqué sur <b>\"J'ai compris\"</b>, "
        "avec horodatage certifié conforme pour les obligations légales ANTIC.",
        body_style
    ))

    story.append(Paragraph("3. Centre des 15 Rapports d'Activité Réels (D-03)", h2_style))
    story.append(Paragraph(
        "Conformément à la règle <b>R1 (Zéro donnée fictive)</b>, 100% des indicateurs proviennent de la base de données réelle :<br/>"
        "• <b>R01 à R05 (Opérations)</b> : Ventes quotidiennes, temps moyen de livraison, taux de service par quartier, volume livré par coursier.<br/>"
        "• <b>R06 à R10 (Finance & Grand Livre)</b> : Encaissements Mobile Money, cash collecté par les livreurs, créances, balance générale débit/crédit.<br/>"
        "• <b>R11 à R15 (Conformité & Quotas)</b> : Taux d'utilisation du quota 5 bouteilles, anomalies de vente au comptoir, logs d'audit trail.<br/>"
        "• Export disponible en format CSV et PDF audité.",
        body_style
    ))

    story.append(Paragraph("4. Grand Livre Immuable en Partie Double & Reversements (D-06)", h2_style))
    story.append(Paragraph(
        "• Système de comptabilité <i>Insert-Only</i> : aucune écriture ne peut être modifiée ni supprimée.<br/>"
        "• Les reversements consolidés aux distributeurs et livreurs sont exécutés en lots (<code>PayoutBatch</code>). "
        "Tout lot supérieur à 500 000 FCFA requiert obligatoirement une double approbation administrative.",
        body_style
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 8 : SECTION 7 — MATRICE DES URLS ET PROTOCOLES D'URGENCE
    # =========================================================================
    story.append(Paragraph("Section 7 : Matrice des URLs & Protocoles d'Urgence", h1_style))
    story.append(Paragraph(
        "Répertoire opposable des routes de l'application et mesures de sécurité opérationnelle.",
        body_style
    ))

    story.append(Paragraph("Matrice des Portails et Droits d'Accès", h2_style))

    urls_table_data = [
        [
            Paragraph("<b>Route Front-end</b>", table_header_style),
            Paragraph("<b>Public Autorisé</b>", table_header_style),
            Paragraph("<b>Authentification Requise</b>", table_header_style),
            Paragraph("<b>Comportement Hors Droit</b>", table_header_style)
        ],
        [
            Paragraph("<code>/</code>", table_cell_bold),
            Paragraph("Tout public", table_cell_style),
            Paragraph("Libre (Anonyme)", table_cell_style),
            Paragraph("Accessible 200 OK", table_cell_style)
        ],
        [
            Paragraph("<code>/search</code>, <code>/stores</code>", table_cell_bold),
            Paragraph("Acheteurs, Visiteurs", table_cell_style),
            Paragraph("Libre (Géoloc au clic)", table_cell_style),
            Paragraph("Accessible 200 OK", table_cell_style)
        ],
        [
            Paragraph("<code>/login</code>, <code>/register</code>", table_cell_bold),
            Paragraph("Tout public", table_cell_style),
            Paragraph("Défi WhatsApp PG-XXXX", table_cell_style),
            Paragraph("Accessible 200 OK", table_cell_style)
        ],
        [
            Paragraph("<code>/acheteur</code>, <code>/account</code>", table_cell_bold),
            Paragraph("Acheteurs particuliers", table_cell_style),
            Paragraph("Session Acheteur obligatoire", table_cell_style),
            Paragraph("Redirection <code>/login</code> (404 API)", table_cell_style)
        ],
        [
            Paragraph("<code>/checkout</code>", table_cell_bold),
            Paragraph("Acheteurs identifiés", table_cell_style),
            Paragraph("Compte vérifié obligatoire", table_cell_style),
            Paragraph("Blocage écran connexion D-14", table_cell_style)
        ],
        [
            Paragraph("<code>/distributor/inventory</code>", table_cell_bold),
            Paragraph("Distributeurs Agréés", table_cell_style),
            Paragraph("Rôle <code>DISTRIBUTOR</code>", table_cell_style),
            Paragraph("Redirection <code>/login/personnel</code>", table_cell_style)
        ],
        [
            Paragraph("<code>/distributor/counter</code>", table_cell_bold),
            Paragraph("Distributeurs Agréés", table_cell_style),
            Paragraph("Rôle <code>DISTRIBUTOR</code>", table_cell_style),
            Paragraph("Blocage & Reçu 404 strict", table_cell_style)
        ],
        [
            Paragraph("<code>/delivery</code>", table_cell_bold),
            Paragraph("Livreurs Agréés", table_cell_style),
            Paragraph("Rôle <code>COURIER</code>", table_cell_style),
            Paragraph("Redirection <code>/login/personnel</code>", table_cell_style)
        ],
        [
            Paragraph("<code>/gestionnaire</code>", table_cell_bold),
            Paragraph("Gestionnaires de compte", table_cell_style),
            Paragraph("Rôle <code>ACCOUNT_MANAGER</code>", table_cell_style),
            Paragraph("Rejet 404 strict (Aucune Trace)", table_cell_style)
        ],
        [
            Paragraph("<code>/admin/dashboard</code>", table_cell_bold),
            Paragraph("Administrateurs", table_cell_style),
            Paragraph("Rôles <code>ADMIN_*</code>", table_cell_style),
            Paragraph("Rejet 404 strict (Aucune Trace)", table_cell_style)
        ],
        [
            Paragraph("<code>/admin/account-cases</code>", table_cell_bold),
            Paragraph("Support & Superviseurs", table_cell_style),
            Paragraph("Rôles <code>ADMIN</code>, <code>MANAGER</code>", table_cell_style),
            Paragraph("Maker-Checker obligatoire", table_cell_style)
        ],
    ]
    urls_table = Table(urls_table_data, colWidths=[42 * mm, 38 * mm, 46 * mm, 48 * mm])
    urls_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_DARK),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_CARD_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [COLOR_WHITE, COLOR_LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(urls_table)

    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph("Protocoles d'Urgence et Sécurité des Personnes", h2_style))
    story.append(Paragraph(
        "<b>1. En cas d'Odeur Suspecte ou Fuite de Gaz Avérée :</b><br/>"
        "• Ne toucher à aucun interrupteur électrique, ni téléphone portable à proximité de la bouteille.<br/>"
        "• Fermer immédiatement le détendeur/robinet de sécurité en tournant la vanne rouge.<br/>"
        "• Aérer largement le local en ouvrant portes et fenêtres.<br/>"
        "• Évacuer les occupants et composer immédiatement le <b>118</b> ou le <b>18</b> (Sapeurs-Pompiers Cameroun).<br/>"
        "• Contacter le numéro vert support d'urgence PLEINGAZ.",
        body_style
    ))

    story.append(Paragraph(
        "<b>2. En cas de Litige Coursier / Client :</b><br/>"
        "• Si la cliente conteste la livraison, le coursier ne doit pas forcer la transaction.<br/>"
        "• La cliente clique sur <b>\"Signaler un litige\"</b> dans son espace. "
        "La course passe en statut <code>DISPUTED</code> et une alerte immédiate est transmise à l'<code>ACCOUNT_MANAGER</code> de permanence pour enquête contradictoire sous 2 heures.",
        body_style
    ))

    story.append(Spacer(1, 4 * mm))
    story.append(HRFlowable(width="100%", thickness=1, color=COLOR_CARD_BORDER, spaceAfter=8))
    story.append(Paragraph(
        "<font color='#6B7280' size='7'>PLEINGAZ DIGITAL DISTRIBUTION NETWORK • CONFORME DIRECTIVES CR-001 & CR-003 • REPRODUCTION INTERDITE SANS AUTORISATION INFOTECH S.A.</font>",
        ParagraphStyle('FooterNotice', parent=body_style, alignment=1)
    ))

    # Génération du document final
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Document PDF généré avec succès : {filename}")

if __name__ == '__main__':
    target_path = '/home/durel/pleingaz/docs/PLEINGAZ_Manuel_Utilisation_et_Architecture.pdf'
    artifact_path = '/home/durel/.gemini/antigravity/brain/9cf01850-1003-4d7d-8ad5-839a5aa3db5f/PLEINGAZ_Manuel_Utilisation_et_Architecture.pdf'
    
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    os.makedirs(os.path.dirname(artifact_path), exist_ok=True)

    build_pdf(target_path)
    build_pdf(artifact_path)
