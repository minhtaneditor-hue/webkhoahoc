"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { 
  Play, 
  ChevronLeft, 
  Clock, 
  Shield, 
  BarChart, 
  Video,
  Loader2,
  CheckCircle,
  Tag
} from 'lucide-react';
import Link from 'next/link';

export default function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
        
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index', { ascending: true });

      setCourse(courseData);
      setLessons(lessonsData || []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleApplyPromo = () => {
    if (!course) return;
    const code = promoCode.toUpperCase();
    let discount = 0;
    if (code === 'TANLAB') discount = 500000;
    else if (code === 'GIAM10') discount = course.price * 0.1;
    else if (code === 'CHALLENGE') discount = 1000000;

    setAppliedDiscount(discount);
    if (discount > 0) {
      alert(`Mã hợp lệ! Bạn được giảm ${new Intl.NumberFormat('vi-VN').format(discount)}đ`);
    } else {
      alert('Mã không hợp lệ');
    }
  };

  const handlePayment = async () => {
    if (!course) return;
    setPaymentLoading(true);
    try {
      const response = await fetch('/api/payment/vnpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          amount: course.price,
          courseTitle: course.title,
          promoCode: appliedDiscount > 0 ? promoCode : undefined,
          userId: 'guest_user_123' 
        })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (err) {
      alert('Lỗi kết nối server');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-accent-secondary" size={48} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
        <Link href="/" className="text-accent-primary hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20">
      {/* Header / Nav */}
      <nav className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors">
          <ChevronLeft size={20} />
          Back to Catalog
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Content */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">{course.title}</h1>
            <p className="text-xl text-text-muted leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Social Proof / Stats */}
          <div className="flex flex-wrap gap-4 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-sm">
              <Clock size={16} className="text-accent-secondary" />
              <span>Self-paced Learning</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-sm">
              <Shield size={16} className="text-green-500" />
              <span>Lifetime Access</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-sm">
              <BarChart size={16} className="text-blue-500" />
              <span>All levels welcome</span>
            </div>
          </div>

          {/* Curriculum */}
          <section className="mb-12">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Video className="text-accent-primary" />
              Course Curriculum
            </h3>
            <div className="space-y-4">
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className="p-5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-4 group hover:border-white/10 transition-all">
                  <div className="flex-none w-10 h-10 rounded-full glass-effect flex items-center justify-center font-mono text-sm group-hover:text-accent-secondary transition-colors">
                    {(idx + 1).toString().padStart(2, '0')}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold">{lesson.title}</h4>
                    <p className="text-sm text-text-muted">{lesson.content?.substring(0, 80)}...</p>
                  </div>
                  <Play size={18} className="text-accent-primary/40" />
                </div>
              ))}
              {lessons.length === 0 && (
                <p className="text-text-muted italic">No lessons have been added to this curriculum yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Sidebar - Purchase Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-12 p-8 rounded-3xl border border-accent-primary/20 bg-gradient-to-br from-[#1a1a2e] to-black shadow-2xl overflow-hidden relative">
            {/* Glow Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/10 blur-[60px] rounded-full -mr-10 -mt-10" />
            
            <div className="relative z-10">
              <div className="mb-6">
                <span className="text-text-muted text-sm uppercase tracking-widest font-bold">Total Investment</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl font-black">
                    {new Intl.NumberFormat('vi-VN').format(course.price - appliedDiscount)}đ
                  </span>
                  {appliedDiscount > 0 && (
                    <span className="text-lg text-text-muted line-through">
                      {new Intl.NumberFormat('vi-VN').format(course.price)}đ
                    </span>
                  )}
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="mb-8">
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input 
                      type="text" 
                      placeholder="Promo Code"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-accent-primary focus:outline-none transition-all uppercase text-sm"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleApplyPromo}
                    className="px-4 py-2 rounded-xl border border-accent-secondary/50 text-accent-secondary text-sm font-bold hover:bg-accent-secondary/10 transition-all"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={paymentLoading}
                className="w-full btn-premium flex items-center justify-center gap-3 py-4 rounded-2xl mb-6"
              >
                {paymentLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Enroll Now
                  </>
                )}
              </button>

              <div className="space-y-4">
                <p className="text-xs text-center text-text-muted">
                  Secured by VNPay. Instant access after purchase.
                </p>
                <div className="flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-grayscale">
                  {/* Logos or Icons for payment methods could go here */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
