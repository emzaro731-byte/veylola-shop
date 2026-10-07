# Veylola Finds

Veylola now has two connected sites:

- **Customer store:** `veylola-shop`
- **Admin publisher:** `veylola-admin`

Both use the same Supabase product database. Render supports deploying multiple apps from one monorepo by giving each service its own Root Directory. citeturn0search0

## 1. Supabase

Run `supabase/schema.sql` in the Supabase SQL Editor.

Then create your private admin login in Supabase Authentication > Users.

## 2. Environment variables

Add these variables to **both** Render services:

`NEXT_PUBLIC_SUPABASE_URL`
`NEXT_PUBLIC_SUPABASE_ANON_KEY`

Use your Supabase project values.

## 3. Customer Render service

Root Directory: `apps/customer`
Build Command: `yarn install && yarn build`
Start Command: `yarn start`

## 4. Admin Render service

Root Directory: `apps/admin`
Build Command: `yarn install && yarn build`
Start Command: `yarn start`

## 5. How publishing works

1. Sign in at the Admin site.
2. Add the product name, image, price, description and AliExpress affiliate URL.
3. Turn on **Publish on customer site**.
4. Click **Publish product**.
5. The product appears on the customer storefront.
6. Customers click **View deal** and are sent to the AliExpress affiliate URL.

The customer site does not expose the admin publishing controls.