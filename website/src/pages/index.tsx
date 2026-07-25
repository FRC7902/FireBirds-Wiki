import type {ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './index.module.css';

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Official wiki for Markham FireBirds, FRC Team 7902">
      <header className={styles.heroBanner}>
        <div className={styles.heroContainer}>
          <div className={styles.heroLogo}>
            <img src="/img/logo.svg" alt="FireBirds Logo" />
          </div>
          <Heading as="h1" className={styles.heroTitle}>
            {siteConfig.title}
          </Heading>
          <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
          <p className={styles.heroDescription}>
            Welcome to the official wiki for Markham FireBirds! This knowledge base
            contains documentation across Engineering, Business, and Strategy.
          </p>
          <div className={styles.heroButtons}>
            <Link className={styles.primaryButton} to="/docs/engineering">
              Engineering
            </Link>
            <Link className={styles.primaryButton} to="/docs/business">
              Business
            </Link>
            <Link className={styles.primaryButton} to="/docs/strategy">
              Strategy
            </Link>
          </div>
        </div>
      </header>
      <main className={styles.mainContent}>
        <section className={styles.section}>
          <Heading as="h2">Engineering</Heading>
          <p>
            CAD models, manufacturing processes, programming resources, and
            technical documentation for FRC Team 7902.
          </p>
          <Link to="/docs/engineering">Browse Engineering &rarr;</Link>
        </section>
        <section className={styles.section}>
          <Heading as="h2">Business</Heading>
          <p>
            Awards, branding, fundraising, outreach, and 5-year planning for
            the Markham FireBirds organization.
          </p>
          <Link to="/docs/business">Browse Business &rarr;</Link>
        </section>
        <section className={styles.section}>
          <Heading as="h2">Strategy</Heading>
          <p>
            Scouting strategies, match analysis, and game planning for
            competitive robotics.
          </p>
          <Link to="/docs/strategy">Browse Strategy &rarr;</Link>
        </section>
      </main>
    </Layout>
  );
}