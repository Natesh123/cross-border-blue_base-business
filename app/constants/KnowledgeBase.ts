export const KNOWLEDGE_BASE = [
    {
        id: 1,
        topic: "Cross Border",
        keywords: ["what is cross border", "what does cross border mean", "explain what cross border is", "how does cross border work", "describe cross border"],
        answer: "Cross Border is a global remittance platform for secure and fast international transfers. Would you like me to show you how to send money today?"
    },
    {
        id: 2,
        topic: "Send Money Online",
        keywords: ["how can i send money online", "send money digitally", "transfer money through the internet", "make a digital money transfer", "how to send money"],
        answer: "It's super easy! Just log in, add your recipient details, select a payment method, review the fees, and confirm. Want to start a transfer now?"
    },
    {
        id: 3,
        topic: "Exchange Rates",
        keywords: ["exchange rates live", "real-time exchange rates", "do you provide live exchange rates", "exchange rate", "live rate"],
        answer: "Yes, we provide live exchange rates, and the exact rate is locked in before you confirm so there are no surprises. Would you like to see today's live rate?"
    },
    {
        id: 4,
        topic: "Transfer Fees",
        keywords: ["transfer fee", "fees for sending money", "charges for transferring money", "fee", "cost to send"],
        answer: "Our fees are low and transparent, varying slightly depending on the country, currency, and delivery method. We always show the exact fee before you send. Can I check a specific route for you?"
    },
    {
        id: 5,
        topic: "Transfer Time",
        keywords: ["how long does money transfer take", "transfer processing time", "when will the receiver get the money", "how long", "transfer time"],
        answer: "Most transfers arrive instantly, though occasionally they can take 1–2 business days. Would you like me to check the status of a specific transfer for you?"
    },
    {
        id: 6,
        topic: "Sending Limits",
        keywords: ["sending limit", "maximum transfer amount", "daily transfer limit", "limit", "max amount"],
        answer: "Your sending limits depend on your KYC verification level. We increase your limits securely as you verify your profile. Would you like to see your current limits?"
    },
    {
        id: 7,
        topic: "Receiver Information",
        keywords: ["receiver details", "beneficiary details", "recipient details required", "receiver info"],
        answer: "You will need the receiver's full name, phone number, and their bank details. Do you have all that ready to add a new beneficiary?"
    },
    {
        id: 8,
        topic: "Account Opening",
        keywords: ["pay to open an account", "is account registration free", "cost to create account", "open account cost", "free account"],
        answer: "Opening a Cross Border account is completely free. Shall I guide you to the signup page?"
    },
    {
        id: 9,
        topic: "Create Account",
        keywords: ["create account", "open a cross border account", "register for cross border", "register", "sign up"],
        answer: "You can register right here on the app and complete a quick KYC verification to get started. Are you ready to create an account?"
    },
    {
        id: 10,
        topic: "Security",
        keywords: ["is my money safe", "is cross border secure", "secure money transfer", "security", "safe"],
        answer: "Absolutely. We use bank-level encryption and follow strict FCA-regulated security measures. Your money is in safe hands. Is there anything else you'd like to know about our security?"
    },
    {
        id: 11,
        topic: "Failed Transfer Refund",
        keywords: ["refund if transfer fails", "failed transfer refund", "money back if transfer fails", "failed transfer"],
        answer: "I completely understand that a failed transfer is stressful. Rest assured, if a transfer fails, your money is securely refunded. Could you share your transaction reference so I can look into it?"
    },
    {
        id: 12,
        topic: "Transaction Processing",
        keywords: ["transaction pending", "processing transfer", "transfer delayed", "pending status"],
        answer: "When a transfer says 'processing', it means it is undergoing a routine confirmation or bank review. Could you share your transaction reference number so I can check its exact status?"
    },
    {
        id: 13,
        topic: "Refund Policy",
        keywords: ["refund policy", "request refund", "refund terms", "refund"],
        answer: "Refunds are processed quickly when a transfer is eligible for one. To help you better, could you provide the transaction reference number?"
    },
    {
        id: 14,
        topic: "Add Beneficiary",
        keywords: ["add beneficiary", "add recipient", "create beneficiary"],
        answer: "To add someone, just go to your Beneficiary Page, tap 'Add New Beneficiary', and enter their details. Would you like me to take you to that page?"
    },
    {
        id: 15,
        topic: "Wire Transfer",
        keywords: ["wire transfer", "bank transfer"],
        answer: "You can send a wire transfer directly from your Dashboard by selecting 'Wire Transfer'. Can I help you set one up right now?"
    },
    {
        id: 16,
        topic: "Airtime Top-Up",
        keywords: ["airtime top-up", "mobile recharge", "top up airtime", "airtime", "recharge"],
        answer: "Select 'Airtime Top-Up', choose the operator, and complete the recharge in seconds. Would you like to send some airtime now?"
    },
    {
        id: 17,
        topic: "Referral Code",
        keywords: ["referral code", "invite code", "refer and earn", "referral"],
        answer: "You can find your unique referral code right inside your account dashboard. Do you want me to show you where it is?"
    },
    {
        id: 18,
        topic: "Social Media Sharing",
        keywords: ["share app", "social media link", "share referral link", "share on whatsapp"],
        answer: "You can easily share your invite link via WhatsApp, Facebook, Instagram, and Email. Ready to invite your friends?"
    },
    {
        id: 19,
        topic: "Customer Support",
        keywords: ["customer support", "technical support", "contact us", "support", "help"],
        answer: "Our support team is here for you 24/7 via email and phone. Would you like me to connect you to a live agent right now?"
    },
    {
        id: 20,
        topic: "Wallet Balance",
        keywords: ["wallet balance", "show my balance", "financial balance", "balance", "my wallet"],
        answer: "Your wallet balance is dynamically updated and displayed right on your home dashboard. Is there anything else about your account I can help with?"
    }
];

export const getBotResponse = (query: string): string => {
    const normalizedQuery = query.toLowerCase().trim();

    // Find a match based on keywords
    for (const item of KNOWLEDGE_BASE) {
        for (const keyword of item.keywords) {
            // Check if the query contains the keyword (or vice versa for short queries)
            if (normalizedQuery.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(normalizedQuery)) {
                return item.answer;
            }
        }
    }

    // Fallback response if no match is found
    return "Hmm, I want to make sure I give you the right answer — I'm not quite sure I understood that. Could you rephrase, or tap one of the options below? Alternatively, I can connect you to a live agent instantly.";
};
