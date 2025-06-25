import React, { useState } from 'react';

const HelpCenter = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqItems = [
    {
      question: "How do I link a bank account?",
      answer:
        "To link a bank account, go to Settings > Linked Accounts and click 'Manage'. Follow the instructions to securely connect your bank.",
    },
    {
      question: "How can I reset my password?",
      answer:
        "You can reset your password by clicking 'Forgot Password' on the login page. Follow the instructions to receive a reset link.",
    },
    {
      question: "How is my data protected?",
      answer:
        "We use end-to-end encryption and comply with POPIA to ensure your financial data remains secure and private.",
    },
    {
      question: "How do I set up a budget?",
      answer:
        "Navigate to the Goals page from your Dashboard and click 'Create Goal'. Choose a category, amount, and timeline.",
    },
    {
      question: "How can I contact support?",
      answer:
        "Use the 'Contact Support' section in Settings or email us directly at support@yourapp.com.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Help Center</h1>
      <p style={styles.text}>
        Browse frequently asked questions, guides, and support resources to get the most out of your financial tools.
      </p>

      <div style={styles.faqSection}>
        {faqItems.map((item, index) => (
          <div key={index} style={styles.faqItem}>
            <button
              onClick={() => toggleFAQ(index)}
              style={styles.faqQuestion}
            >
              {item.question}
              <span style={styles.chevron}>{openIndex === index ? '▲' : '▼'}</span>
            </button>
            {openIndex === index && <p style={styles.faqAnswer}>{item.answer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #000000 100%)',
    color: 'white',
    padding: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  text: {
    fontSize: '1rem',
    color: '#ccc',
    marginBottom: '2rem',
  },
  faqSection: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  faqItem: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    padding: '1rem',
  },
  faqQuestion: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  faqAnswer: {
    marginTop: '0.5rem',
    color: '#ccc',
    fontSize: '0.95rem',
    lineHeight: '1.5',
  },
  chevron: {
    marginLeft: '1rem',
    fontSize: '0.85rem',
    color: '#999',
  },
};

export default HelpCenter;
