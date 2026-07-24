import type {ReactNode} from 'react';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Engineering',
    description: (
      <>
        CAD models, manufacturing processes, programming resources, and
        technical documentation for FRC Team 7902.
      </>
    ),
  },
  {
    title: 'Business',
    description: (
      <>
        Awards, branding, fundraising, outreach, and 5-year planning for
        the Markham FireBirds organization.
      </>
    ),
  },
  {
    title: 'Strategy',
    description: (
      <>
        Scouting strategies, match analysis, and game planning for
        competitive robotics.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={styles.feature}>
      <Heading as="h3">{title}</Heading>
      <p>{description}</p>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className={styles.container}>
        {FeatureList.map((props, idx) => (
          <Feature key={idx} {...props} />
        ))}
      </div>
    </section>
  );
}