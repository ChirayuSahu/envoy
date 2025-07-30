import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQDropdown = () => {
  const [openIndex, setOpenIndex] = useState(-1);

  const faqs = [
    {
      question: `What is ${process.env.NEXT_PUBLIC_APP_NAME}?`,
      answer:
        `${process.env.NEXT_PUBLIC_APP_NAME} is a secure platform designed to help developers, teams, and organizations manage and synchronize their .env files and sensitive credentials efficiently and securely, eliminating the need to share them via insecure channels.`,
    },
    {
      question: `How does ${process.env.NEXT_PUBLIC_APP_NAME} enhance security?`,
      answer:
        `${process.env.NEXT_PUBLIC_APP_NAME} encrypts your environment variables both in transit and at rest. It provides granular access control and integrates with existing authentication systems to ensure only authorized personnel can access sensitive data.`,
    },
    {
      question: `Is ${process.env.NEXT_PUBLIC_APP_NAME} suitable for small teams?`,
      answer:
        `Absolutely! ${process.env.NEXT_PUBLIC_APP_NAME} is designed to scale from individual developers and small teams to large enterprises. Its intuitive interface and robust features make it ideal for teams of any size looking to improve their secret management.`,
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="font-inter bg-[#F5F7FA] dark:bg-black py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-balance mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400 mb-12">
          Find answers to the most common questions about {process.env.NEXT_PUBLIC_APP_NAME}.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[#121212] rounded-lg shadow-md dark:border dark:border-gray-800 overflow-hidden"
            >
              <button
                className="flex justify-between items-center w-full p-6 text-left text-gray-900 dark:text-white font-semibold text-lg focus:outline-none"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                {faq.question}
                <ChevronDown
                  className={`w-6 h-6 transform transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  } text-green-700 dark:text-green-400`}
                />
              </button>
              <div
                id={`faq-answer-${index}`}
                role="region"
                aria-hidden={openIndex !== index}
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === index ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                }`}
                style={{
                  maxHeight: openIndex === index ? '1000px' : '0px',
                }}
              >
                <p className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQDropdown;
