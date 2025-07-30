"use client"
import React from "react";
import { Users, Building, Network } from "lucide-react";

const CommunitySection = () => {
  const cards = [
    {
      icon: <Users className="w-8 h-8 text-green-700 dark:text-green-400" />,
      title: "For Developers & Teams",
      description:
        "Securely sync your .env files across your team. End the cycle of sending sensitive credentials over Slack or email.",
    },
    {
      icon: <Building className="w-8 h-8 text-green-700 dark:text-green-400" />,
      title: "For Organizations",
      description:
        "Implement organization-wide security policies. Manage access and ensure compliance with ease.",
    },
    {
      icon: <Network className="w-8 h-8 text-green-700 dark:text-green-400" />,
      title: "For Open-Source Projects",
      description:
        "Onboard new contributors faster. Provide them with the necessary environment variables securely without exposing project secrets.",
    },
  ];

  return (
    <section className="font-inter bg-[#F5F7FA] dark:bg-black py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-balance">
          Manage your entire community in a single system
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-4 mb-12">
          Who is {process.env.NEXT_PUBLIC_APP_NAME} suitable for?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#121212] p-8 rounded-lg shadow-md hover:shadow-xl dark:border dark:border-gray-800 hover:-translate-y-2 transition-all duration-300 ease-in-out"
            >
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 w-fit mx-auto p-4 rounded-full mb-6">
                {card.icon}
              </div>
              <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-3">{card.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
