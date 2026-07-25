import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  wikiSidebar: [
    {
      type: 'doc',
      id: 'index',
    },
    {
      type: 'category',
      label: 'Engineering',
      link: {
        type: 'doc',
        id: 'Engineering/index',
      },
      items: [
        'Engineering/index',
        {
          type: 'category',
          label: 'CAD',
          items: [
            'Engineering/CAD/index',
          ],
        },
        {
          type: 'category',
          label: 'Manufacturing',
          items: [
            'Engineering/Manufacturing/index',
            'Engineering/Manufacturing/Manufacturing Curriculum.pdf',
          ],
        },
        {
          type: 'category',
          label: 'Programming',
          items: [
            'Engineering/Programming/index',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Business',
      link: {
        type: 'doc',
        id: 'Business/index',
      },
      items: [
        'Business/index',
        {
          type: 'category',
          label: 'Cash Money Sponsorship',
          items: [
            'Business/Cash Money Sponsorship/index',
          ],
        },
        {
          type: 'category',
          label: '5 Year Plan',
          items: [
            'Business/5 Year Plan/index',
            'Business/5 Year Plan/Untitled document',
            'Business/5 Year Plan/Untitled presentation',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Strategy',
      link: {
        type: 'doc',
        id: 'Strategy/index',
      },
      items: [
        'Strategy/index',
        {
          type: 'category',
          label: 'Scouting',
          items: [
            'Strategy/Scouting/index',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
