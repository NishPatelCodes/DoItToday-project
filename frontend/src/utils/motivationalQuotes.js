/**
 * Motivational Quotes Manager
 * 
 * Collection of inspiring quotes that rotate on the login page
 * Each quote is designed to motivate and inspire users
 * 
 * CUSTOMIZATION:
 * - Add more quotes to the array
 * - Modify quote categories if needed
 * - Adjust quote display duration in Login.jsx
 */

const motivationalQuotes = [
  "Small steps every day lead to big changes.",
  "You're one login away from a productive day.",
  "Clarity begins with action.",
  "Your future is created by what you do today.",
  "Progress, not perfection, is the goal.",
  "Every accomplishment starts with the decision to try.",
  "Focus on progress, not perfection.",
  "The best time to start was yesterday. The second best time is now.",
  "Success is the sum of small efforts repeated day in and day out.",
  "You don't have to be great to start, but you have to start to be great.",
  "What you get by achieving your goals is not as important as what you become.",
  "The way to get started is to quit talking and begin doing.",
  "Productivity is never an accident. It's always the result of commitment to excellence.",
  "Do something today that your future self will thank you for.",
  "The secret of getting ahead is getting started.",
  "Your limitation—it's only your imagination.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Push yourself, because no one else is going to do it for you.",
  "Wake up with determination. Go to bed with satisfaction.",
];

/**
 * Get a random quote from the collection
 * @returns {string} A random motivational quote
 */
const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
};

/**
 * Get a quote by index (useful for cycling through quotes)
 * @param {number} index - The index of the quote to retrieve
 * @returns {string} The quote at the specified index
 */
const getQuoteByIndex = (index) => {
  return motivationalQuotes[index % motivationalQuotes.length];
};

export { motivationalQuotes, getRandomQuote, getQuoteByIndex };

