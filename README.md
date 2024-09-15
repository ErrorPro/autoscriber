This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev:custom
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Docker

1. Build the image `docker build -t autoscriber-assignment .`
2. Run the image `docker run -d -p 3000:3000 autoscriber-assignment`

## Known issues

1. Typescript support
2. Better UX/UI(Mobile support, issues with tailwind + nextjs)
3. Server-side rendering
4. Error handling/boundry
5. Audio files serving(DB, Chunks, Headers)
6. Was developed using chromium, broader support of other browsers need to be addressed.
7. Configurabilty of next js server settings such as port, certificates and more.
