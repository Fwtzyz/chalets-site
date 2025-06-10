export function StatsSection() {
  const stats = [
    {
      number: "500+",
      label: "عقار متاح",
      icon: "🏠",
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: "50+",
      label: "مدينة ومنطقة",
      icon: "📍",
      color: "from-green-500 to-emerald-500"
    },
    {
      number: "1000+",
      label: "عميل سعيد",
      icon: "😊",
      color: "from-purple-500 to-pink-500"
    },
    {
      number: "4.8/5",
      label: "تقييم المنصة",
      icon: "⭐",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            أرقام تتحدث عن نفسها
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            انضم إلى آلاف العملاء الذين اختاروا منصتنا لحجز إجازاتهم المثالية
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center group"
            >
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${stat.color} text-white text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {stat.icon}
              </div>
              <div className="text-4xl md:text-5xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
