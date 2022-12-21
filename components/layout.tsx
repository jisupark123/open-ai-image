import Head from 'next/head';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}
export default function Layout({ children }: LayoutProps) {
  return (
    <React.Fragment>
      <Head>
        <title>지수의 Open-Ai-Image</title>
        <meta name='description' content='PapagoXOpen-Ai-Image' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta property='og:title' content='PapagoXOpen-Ai' />
        <meta property='og:image' content='/picture_bird.webp' />
        <meta
          property='og:description'
          content='Open-Ai-Image를 통해 다양한 이미지를 생성해보세요'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {children}
    </React.Fragment>
  );
}
