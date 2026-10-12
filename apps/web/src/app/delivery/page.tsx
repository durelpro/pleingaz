'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Truck, CheckCircle2, PackageSearch, PackageOpen, Download, ArrowLeft, Store, MapPin, Loader2, FileText, Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

function DeliveryTrackerContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Évaluation / Avis client
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const h: any = { 'Content-Type': 'application/json', 'x-demo-role': 'customer_1' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  const handleSubmitReview = async () => {
    if (!order || selectedRating === 0) return;
    setIsSubmittingReview(true);
    setReviewError(null);
    try {
      const res = await fetch(`http://localhost:3001/orders/${order.id}/review`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          rating: selectedRating,
          comment: reviewComment.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Impossible d\'enregistrer votre avis');
      }

      setReviewSuccess(true);
      await fetchOrderData();
    } catch (e: any) {
      setReviewError(e.message || 'Erreur lors de l\'envoi');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const fetchOrderData = async () => {
    try {
      if (orderId) {
        const res = await fetch(`http://localhost:3001/orders/${orderId}`, {
          headers: getHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          return;
        }
      }
      // Si pas d'orderId ou échec, récupérer la dernière commande de l'acheteur
      const resList = await fetch('http://localhost:3001/orders', {
        headers: getHeaders()
      });
      if (resList.ok) {
        const orders = await resList.json();
        if (Array.isArray(orders) && orders.length > 0) {
          setOrder(orders[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
    // Polling toutes les 3.5s pour mise à jour live du statut
    const interval = setInterval(fetchOrderData, 3500);
    return () => clearInterval(interval);
  }, [orderId]);

  const steps = [
    { key: 'SUBMITTED', label: 'Commande Confirmée', icon: CheckCircle2, desc: 'Reçue par le distributeur' },
    { key: 'ACCEPTED', label: 'Commande Acceptée', icon: PackageSearch, desc: 'Validation par le gérant' },
    { key: 'PREPARING', label: 'Bouteille Préparée', icon: PackageOpen, desc: 'Inspection et sécurité' },
    { key: 'SHIPPED', label: 'En Cours de Livraison', icon: Truck, desc: 'Le livreur est en route' },
    { key: 'DELIVERED', label: 'Gaz Livré & Réceptionné', icon: CheckCircle2, desc: 'Transaction clôturée' },
  ];

  const mapStatusToStepIndex = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'PENDING':
      case 'DRAFT':
        return 0;
      case 'ACCEPTED':
        return 1;
      case 'PREPARING':
      case 'READY_FOR_PICKUP':
        return 2;
      case 'SHIPPED':
      case 'IN_TRANSIT':
        return 3;
      case 'DELIVERED':
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <Loader2 className="animate-spin text-pleingaz-red" size={40} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-16 px-4 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Aucune commande active</h2>
        <p className="text-gray-500 mb-6 max-w-md">Vous n'avez pas de commande en cours de livraison pour le moment.</p>
        <Link href="/search" className="px-6 py-3 bg-pleingaz-red text-white font-bold rounded-xl shadow-lg shadow-orange-500/20">
          Trouver du gaz maintenant
        </Link>
      </div>
    );
  }

  const currentStepIndex = mapStatusToStepIndex(order.status);
  const otpCode = order.delivery?.confirmationOtp || order.orderNumber.slice(-4);
  const isDelivered = order.status === 'DELIVERED' || order.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        
        <Link 
          href="/buyer/portal" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-pleingaz-red transition-colors font-bold"
        >
          <ArrowLeft size={18} /> Retour à mon espace client
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-pleingaz-red text-xs font-black rounded-full uppercase tracking-wider">
            {order.type === 'B2C_DELIVERY' ? 'Livraison Express' : 'Retrait Boutique'}
          </span>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Suivi de Commande
          </h1>
          <p className="text-gray-500 font-semibold">{order.orderNumber}</p>
        </div>

        {/* Store & Delivery Info Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-pleingaz-red flex items-center justify-center font-bold">
                <Store size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{order.store?.name || 'Boutique Agréée'}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                  <MapPin size={12} /> {order.store?.neighborhood || 'Douala'}, {order.store?.city || 'Cameroun'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-pleingaz-red">{order.totalAmount} FCFA</p>
              <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                Payé
              </span>
            </div>
          </div>

          {order.deliveryAddress && (
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-start gap-2 bg-gray-50 dark:bg-neutral-800/50 p-3 rounded-xl">
              <MapPin size={16} className="text-pleingaz-red shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 dark:text-white">Adresse de livraison : </span>
                {order.deliveryAddress}
              </div>
            </div>
          )}
        </div>

        {/* Steps Tracker Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-neutral-800">
          <div className="relative">
            {/* Ligne verticale de fond */}
            <div className="absolute left-[27px] top-6 bottom-6 w-1 bg-gray-100 dark:bg-neutral-800 rounded-full" />
            
            <div className="space-y-8 relative">
              {steps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const Icon = step.icon;
                
                return (
                  <div key={step.key} className="flex items-center gap-6">
                    <motion.div 
                      initial={false}
                      animate={{ 
                        backgroundColor: isActive ? '#f97316' : '#f3f4f6',
                        scale: isCurrent ? 1.15 : 1
                      }}
                      className={`w-14 h-14 rounded-full flex items-center justify-center z-10 shadow-sm ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-600 dark:bg-neutral-800'}`}
                    >
                      <Icon size={24} />
                    </motion.div>
                    
                    <div className="flex-1">
                      <h3 className={`font-bold text-base ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                        {step.label}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {step.desc}
                      </p>
                      {isCurrent && step.key === 'SHIPPED' && (
                        <p className="text-xs text-pleingaz-red font-bold mt-1 animate-pulse">
                          🛵 Le livreur arrive chez vous, préparez votre code !
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Code OTP Secret */}
        {!isDelivered && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/10 rounded-3xl p-6 border-2 border-orange-200 dark:border-orange-800/50 text-center space-y-3 shadow-md shadow-orange-500/5">
            <h3 className="font-black text-orange-900 dark:text-orange-300 text-lg">
              Code Secret de Confirmation
            </h3>
            <p className="text-orange-800 dark:text-orange-400 text-xs font-medium max-w-sm mx-auto">
              Communiquez ce code au distributeur ou au livreur <strong>uniquement</strong> lorsque votre bouteille de gaz est entre vos mains.
            </p>
            <div 
              onClick={() => {
                navigator.clipboard.writeText(otpCode);
                setCopiedOtp(true);
                setTimeout(() => setCopiedOtp(false), 2000);
              }}
              className="inline-flex items-center justify-center gap-3 bg-white dark:bg-neutral-900 px-8 py-3 rounded-2xl border border-orange-300 dark:border-orange-700/50 shadow-inner cursor-pointer hover:scale-105 transition-transform"
            >
              <span className="text-4xl font-black text-pleingaz-red tracking-[0.25em]">
                {otpCode}
              </span>
              {copiedOtp && <Check size={18} className="text-green-500" />}
            </div>
            <p className="text-[11px] text-gray-500">Cliquez pour copier le code</p>
          </div>
        )}

        {/* Avis Client & Évaluation post-livraison */}
        {isDelivered && (
          <div className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-neutral-800 space-y-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                <Star size={22} className="fill-amber-400 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  {order.review ? "Votre avis sur cette commande" : "Évaluez votre expérience"}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {order.review ? "Merci pour votre retour d'expérience !" : "Gagnez +10 points de fidélité en donnant votre avis vérifié"}
                </p>
              </div>
            </div>

            {order.review ? (
              <div className="bg-amber-50/60 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200/60 dark:border-amber-800/30 space-y-2">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      className={s <= order.review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-neutral-700"}
                    />
                  ))}
                  <span className="ml-2 text-sm font-black text-amber-900 dark:text-amber-300">
                    {order.review.rating}/5
                  </span>
                </div>
                {order.review.comment && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    « {order.review.comment} »
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2 text-xs font-bold text-green-600 dark:text-green-400">
                  <CheckCircle2 size={15} /> Avis vérifié enregistré (+10 points crédités)
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {reviewSuccess ? (
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl text-center space-y-1">
                    <p className="font-bold text-green-700 dark:text-green-300">
                      🎉 Merci pour votre avis !
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      +10 points de fidélité ont été ajoutés à votre compte.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center sm:items-start gap-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                        Votre note :
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setSelectedRating(star)}
                            className="p-1 transition-transform hover:scale-125 focus:outline-none"
                            aria-label={`Noter ${star} sur 5`}
                          >
                            <Star
                              size={28}
                              className={
                                star <= selectedRating
                                  ? "fill-amber-400 text-amber-400 transition-colors"
                                  : "text-gray-300 dark:text-neutral-700 transition-colors hover:text-amber-300"
                              }
                            />
                          </button>
                        ))}
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-2">
                          {selectedRating > 0 ? `${selectedRating}/5` : 'Cliquez pour noter'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                        Commentaire (facultatif) :
                      </label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Ex: Livreur très ponctuel, bouteille en parfait état avec le sceau intact !"
                        rows={3}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-pleingaz-red text-gray-900 dark:text-white"
                      />
                    </div>

                    {reviewError && (
                      <p className="text-xs text-red-500 font-bold">{reviewError}</p>
                    )}

                    <button
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview || selectedRating === 0}
                      className="w-full py-3.5 bg-pleingaz-red hover:bg-red-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingReview ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Star size={18} className="fill-white" />
                          Publier mon avis (+10 points)
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Facture Téléchargeable si Livré */}
        {order.invoice && (
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 space-y-4 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 text-green-600 font-bold">
              <CheckCircle2 size={20} /> Commande Clôturée avec Succès
            </div>
            <button 
              onClick={() => alert(`Facture PLEINGAZ\n\nNuméro: ${order.invoice.invoiceNumber}\nVendeur: ${order.invoice.sellerName}\nMontant: ${order.invoice.totalAmount} FCFA\nDate: ${new Date(order.invoice.createdAt).toLocaleString()}\nStatut: PAYÉ ET LIVRÉ`)}
              className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-lg"
            >
              <FileText size={20} />
              Consulter la Facture {order.invoice.invoiceNumber}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function DeliveryTrackerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-gray-500"><Loader2 className="animate-spin text-pleingaz-red mr-2" /> Chargement du suivi...</div>}>
      <DeliveryTrackerContent />
    </Suspense>
  );
}

