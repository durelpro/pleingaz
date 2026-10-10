'use client';

import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  contextMessage?: string;
  label?: string;
  className?: string;
}

export function WhatsAppButton({ 
  phoneNumber = '237657696567', // Numéro de support Pleingaz par défaut
  contextMessage = 'Bonjour PLEINGAZ, j\'ai besoin d\'assistance.',
  label = 'Discuter sur WhatsApp',
  className = ''
}: WhatsAppButtonProps) {
  
  const handleChat = () => {
    // Nettoyer le numéro (enlever les + et les espaces)
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(contextMessage);
    
    // Détecter si on est sur mobile pour ouvrir l'app native
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const url = isMobile 
      ? `whatsapp://send?phone=\${cleanNumber}&text=\${encodedMessage}`
      : `https://wa.me/\${cleanNumber}?text=\${encodedMessage}`;
      
    window.open(url, '_blank');
  };

  return (
    <button 
      onClick={handleChat}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-2xl shadow-lg shadow-green-500/30 transition-all hover:-translate-y-0.5 \${className}`}
    >
      <MessageCircle className="w-5 h-5" />
      {label}
    </button>
  );
}
