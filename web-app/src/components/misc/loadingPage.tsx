import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const LoadingPage = () => {
  const [fact, setFact] = useState('');

  const envFacts = [
    "Did you know? AES encryption is one of the most secure ways to protect your API keys and secrets.",
    "Fact: Storing environment variables in plain text is a leading cause of data breaches.",
    "Think about it: Automating .env file sharing saves hours of manual setup for every new developer.",
    "Interesting: Centralized secret management reduces human errors and keeps your environments in sync.",
    "Every bit helps: Rotating your encryption keys regularly minimizes potential security risks."
  ];

  const securityFacts = [
    "Security tip: Never commit your .env files to public repositories to avoid secret leaks.",
    "Did you know? Two-factor authentication (2FA) significantly improves account security when sharing secrets.",
    "Fact: Using group-based access control ensures only authorized members can view sensitive variables.",
    "Stay safe: Encrypting secrets during both storage and transfer prevents data interception.",
    "Protect yourself: Regularly auditing access logs helps detect unauthorized attempts early."
  ];

  useEffect(() => {
    const allFacts = [...envFacts, ...securityFacts];

    let lastFact = '';
    const pickRandomFact = () => {
      let randomFact;
      do {
        randomFact = allFacts[Math.floor(Math.random() * allFacts.length)];
      } while (randomFact === lastFact);
      lastFact = randomFact;
      setFact(randomFact);
    };
    
    pickRandomFact();

    const interval = setInterval(pickRandomFact, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-gray-100 dark:bg-[#121212] text-[#00916C] transition-all p-4">
      <Loader2 className="animate-spin w-12 h-12 mb-4" />
      <p className="text-xl font-semibold dark:text-[#00916C] text-center mb-2">
        Loading, please wait...
      </p>
      {fact && (
        <p className="text-md text-gray-700 dark:text-gray-300 text-center max-w-md animate-fade-in-up">
          {fact}
        </p>
      )}
    </div>
  );
};

export default LoadingPage;
