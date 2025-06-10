export function FeaturesSection() {
  const features = [
    {
      icon: "🏖️",
      title: "شاليهات مميزة",
      description: "مجموعة متنوعة من الشاليهات والفلل في أجمل المواقع السياحية"
    },
    {
      icon: "⚡",
      title: "حجز فوري",
      description: "احجز شاليهك المفضل في دقائق معدودة بنظام حجز سهل وآمن"
    },
    {
      icon: "🛡️",
      title: "ضمان الجودة",
      description: "جميع الشاليهات معتمدة ومفحوصة لضمان أفضل تجربة إقامة"
    },
    {
      icon: "📞",
      title: "دعم 24/7",
      description: "فريق دعم متاح على مدار الساعة لمساعدتك في أي وقت"
    },
    {
      icon: "💰",
      title: "أسعار تنافسية",
      description: "أفضل الأسعار مع عروض وخصومات حصرية للعملاء"
    },
    {
      icon: "⭐",
      title: "تقييمات موثوقة",
      description: "تقييمات حقيقية من النزلاء لمساعدتك في اختيار الأنسب"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            لماذا شاليهات السعودية؟
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            نحن نقدم أفضل تجربة حجز شاليهات في المملكة العربية السعودية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="text-5xl mb-6 text-center">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">
              ابدأ رحلتك معنا اليوم
            </h3>
            <p className="text-xl mb-6 text-white/90">
              انضم إلى آلاف العملاء الراضين واحجز شاليهك المثالي
            </p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
              تصفح الشاليهات الآن
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
