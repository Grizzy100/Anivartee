import dotenv from 'dotenv';
import Stripe from 'stripe';
import * as fs from 'fs';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2023-10-16' as any,
});

async function main() {
    console.log("Generating Pro Product and Prices on your Stripe Test Account...");

    // 1. Create the Product
    const product = await stripe.products.create({
        name: 'Pro',
        description: 'Advanced Analytics and Features',
    });

    console.log(`✅ Created Product: ${product.id}`);

    // 2. Create the Prices
    const pricesToCreate = [
        { currency: 'inr', unit_amount: 6000, lookup_key: 'IN' }, // 60.00 INR
        { currency: 'usd', unit_amount: 500, lookup_key: 'SEA' },  // 5.00 USD
        { currency: 'usd', unit_amount: 1000, lookup_key: 'GLOBAL' }, // 10.00 USD
        { currency: 'eur', unit_amount: 800, lookup_key: 'EU' }, // 8.00 EUR
        { currency: 'jpy', unit_amount: 500, lookup_key: 'JP' }, // 500 JPY
        { currency: 'usd', unit_amount: 800, lookup_key: 'ME' }, // 8.00 USD
    ];

    const results: any = {};

    for (const p of pricesToCreate) {
        const stripePrice = await stripe.prices.create({
            product: product.id,
            currency: p.currency,
            unit_amount: p.unit_amount,
            recurring: { interval: 'month' },
        });
        results[`STRIPE_PRICE_ID_${p.lookup_key}`] = stripePrice.id;
        console.log(`✅ Created Price for ${p.lookup_key}: ${stripePrice.id}`);
    }


    fs.writeFileSync('stripe_prices.json', JSON.stringify(results, null, 2));
    console.log("Wrote IDs to stripe_prices.json");

}

main().catch(console.error);
