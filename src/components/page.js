import { DefaultSeo } from 'next-seo';
import Box from '@codeday/topo/Atom/Box';
import Header, { SiteLogo } from '@codeday/topo/Organism/Header';
import Footer from '@codeday/topo/Organism/Footer';
import { Labs } from '@codeday/topo/Atom/Logo';

// TODO: Set production domain
const DOMAIN = 'https://labs-match.codeday.org';

export default ({ children, title, darkHeader, slug }) => (
  <>
    <DefaultSeo
      title={title}
      description="Select your preferences for CodeLabs projects."
      canonical={`${DOMAIN}${slug}`}
      openGraph={{
        type: 'website',
        locale: 'en_US',
        site_name: 'CodeLabs',
        url: `${DOMAIN}${slug}`,
      }}
      twitter={{
        handle: '@codeday',
        site: '@codeday',
        cardType: 'summary_large_image',
      }}
    />
    <Box position="relative">
      <Header darkBackground={darkHeader} gradAmount={darkHeader && 'lg'} underscore position="relative" zIndex={1000}>
        <SiteLogo>
          <a href="/">
            <Labs withText />
          </a>
        </SiteLogo>
      </Header>
      {children}
      <Footer />
    </Box>
  </>
);
