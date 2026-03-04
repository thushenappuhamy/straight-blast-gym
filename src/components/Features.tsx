export function Features() {
  const features = [
    {
      icon: "💪",
      title: "AI Workout Plans",
      description: "Rule-based AI generates personalized programs from your BMI, goals & fitness level.",
    },
    {
      icon: "🥗",
      title: "Nutrition Plans",
      description: "Calorie-matched meal plans designed around your dietary preferences and targets.",
    },
    {
      icon: "💊",
      title: "Supplement Shop",
      description: "Browse and purchase gym-approved supplements online.",
    },
    {
      icon: "👨‍🏫",
      title: "Expert Trainers",
      description: "Book one-on-one sessions with certified personal trainers at SBG.",
    },
  ];

  return (
    <section className="bg-[#1A1816] py-0">
      <div className="container mx-auto px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#0D0C0B] border-r border-b border-[#3D3831] p-8 lg:p-10 hover:bg-[#1A1816] transition-colors group"
            >
              <div className="space-y-4">
                {/* Icon */}
                <div className="text-4xl mb-4">{feature.icon}</div>
                
                {/* Title */}
                <h3 className="text-[#F4D03F] text-lg font-black uppercase tracking-wide">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
