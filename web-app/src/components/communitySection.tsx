import React from "react";
import { Users, Building, Network } from "lucide-react"; // Replace with your own icons or any icon library

const CommunitySection = () => {
  const cards = [
    {
      icon: <Users className="w-6 h-6 text-green-700" />,
      title: "[placeholder]",
      description:
        "Our membership management software provides full automation of membership renewals and payments",
    },
    {
      icon: <Building className="w-6 h-6 text-green-700" />,
      title: "[placeholder]",
      description:
        "Our membership management software provides full automation of membership renewals and payments",
    },
    {
      icon: <Network className="w-6 h-6 text-green-700" />,
      title: "[placeholder]",
      description:
        "Our membership management software provides full automation of membership renewals and payments",
    },
  ];

  return (
    <section className="bg-[#F5F7FA] py-16 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Manage your entire community <br /> in a single place
        </h2>
        <p className="text-sm text-gray-500 mt-2 mb-10">Who is [Name] suitable for?</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-15">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded shadow-sm hover:shadow-md transition"
            >
              <div className="bg-green-100 w-fit mx-auto p-2 rounded mb-4">
                {card.icon}
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{card.title}</h3>
              <p className="text-sm text-gray-600">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
