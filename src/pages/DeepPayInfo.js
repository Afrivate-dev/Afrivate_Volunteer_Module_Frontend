import React from 'react';

const DeepPayInfo = () => {
  const steps = [
    {
      number: 1,
      title: 'Freelancer defines a minimum DeepPay balance while creating an Agreement.',
      icon: '💼'
    },
    {
      number: 2,
      title: 'Employer fund DeepPay according to the Payment terms in the Agreement.',
      icon: '💰'
    },
    {
      number: 3,
      title: 'Freelancer begins to deliver work according to the expectations set in the Agreement.',
      icon: '🎯'
    },
    {
      number: 4,
      title: 'Employer can use the funds in DeepPay to make payments after reviewing the submitted work.',
      icon: '✅'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative">
            <img
              src="/topimage.png"
              alt="Workspace"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-purple-900 bg-opacity-60 flex items-center justify-center">
              <h1 className="text-2xl md:text-3xl font-bold text-white text-center px-4">
                Payment Protection with DeepPay
              </h1>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-center">
              DeepPay is a secure, transparent and convenient way to make and receive payments for online freelance services on AfriVate.
            </p>
          </div>
        </div>

        {/* What is DeepPay */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-purple-900 mb-4">What is DeepPay?</h2>
          <p className="text-gray-600">
            DeepPay holds payments in escrow to ensure that the agreed amount is funded by the Employer before starting work. When DeepPay is funded, the Freelancer can feel confident that funds are available, and the Employer feels secure that work can be reviewed before making the payment. DeepPay helps create transparency on the platform.
          </p>
        </div>

        {/* How does DeepPay Work */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-purple-900 mb-4">How does DeepPay Work?</h2>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                  {step.number}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-gray-700">{step.title}</p>
                  {index < steps.length - 1 && (
                    <div className="absolute left-4 mt-4 w-0.5 h-8 bg-purple-200"></div>
                  )}
                </div>
              </div>
            ))}
            <div className="bg-purple-900 text-white text-center py-3 px-4 rounded-lg">
              Freelancer gets paid for the completed work
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600 mb-8">
            Funds in DeepPay aren't tied to one specific job or task and can be used to make payments for any work done with respect to the job on our online freelance marketplace. An Employer can pay for tasks, milestones, hours, miscellaneous work, or even bonuses. Funds can be released to either the Employer or the Freelancer in the case of a disagreement, either party can request Arbitration, as long as funds are available in DeepPay.
          </p>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Is it mandatory to use DeepPay?</h3>
                <p className="text-gray-600">
                  No, it is not mandatory to use DeepPay. We recommend the use of DeepPay especially when you are working with an Employer for the first time.
                </p>
              </div>
              {/* Add more FAQs as needed */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepPayInfo; 