import React, { useEffect, useState } from 'react';

export default function About() {
    return (
        <main>
            <AboutSection />
            <hr />
            <FamilyMembers />
            <hr />
            <div className="how-to-use">
                <h1>How to Use</h1>
                <h3>Setting Up Your Family</h3>
                <p>
                    One parent of the family should register under the `Login` page where they will receive a family code.
                    Other members of the family will be able to use this code to join the family.
                    The parent who registered can designate other members as parents/admins after they join.
                </p>
                <h3>Using the app</h3>
                <p>
                    Once you are logged in, you will be able to see your family's to-do list, as well as your personal list.
                    Tasks can be added and marked as complete by anyone, but only a parent can remove tasks.
                    Only parents can add or remove family members, as well as change their roles.
                </p>
            </div>
        </main>
    );
}

function AboutSection() {
    const [quote, setQuote] = useState({ text: '', author: '' });
    const quoteAPIKey = 'OjGxIKgEi0GdgkCLjXu8Zg==qdPcUObV6hC4DX7m';
    const quoteAPIURL = 'https://api.api-ninjas.com/v1/quotes?category=family';

    useEffect(() => { getFamilyQuotes(); }, []);

    async function getFamilyQuotes() {
        try {
            const response = await fetch(quoteAPIURL, {
                headers: {
                    'X-Api-Key': quoteAPIKey
                }
            });
            const data = await response.json();
            if (data && data.length > 0) {
                const { quote, author } = data[0];
                setQuote({ text: quote, author: author });
            }
        } catch (error) {
            console.error('Error fetching family quotes:', error);
            setQuote({ text: 'Error loading quote.', author: '' });
        }
    }

    return (
        <div>
            <h1>About</h1>
            <p>This is a web application made for CS260 at Brigham Young University.</p>
            <p>Here's a quote for your family!</p>
            <blockquote id="quote">
                <i id="quote-text">{quote.text}</i>
                <p id="quote-author">{`- ${quote.author}`}</p>
            </blockquote>
        </div>
    );
}


