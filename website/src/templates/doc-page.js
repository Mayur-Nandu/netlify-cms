import React from 'react';
import Helmet from 'react-helmet';
import { graphql } from 'gatsby';
import 'prismjs/themes/prism-tomorrow.css';

import Layout from '../components/layout';
import EditLink from '../components/edit-link';
import Widgets from '../components/widgets';
import DocsNav from '../components/docs-nav';
import Container from '../components/container';
import SidebarLayout from '../components/sidebar-layout';
import Markdown from '../components/markdown';

const toMenu = (menu, nav) =>
  menu.map(group => ({
    title: group.title,
    group: nav.group.find(g => g.fieldValue === group.name),
  }));

const DocsSidebar = ({ docsNav, location }) => (
  <aside>
    <DocsNav items={docsNav} location={location} />
  </aside>
);

export const DocsTemplate = ({
  title,
  editLinkPath,
  body,
  html,
  showWidgets,
  widgets,
  showSidebar,
  docsNav,
  location,
}) => (
  <Container size="md">
    <SidebarLayout
      sidebar={<div>{showSidebar && <DocsSidebar docsNav={docsNav} location={location} />}</div>}
    >
      <article data-docs-content>
        {editLinkPath && <EditLink path={editLinkPath} />}
        <h1>{title}</h1>
        <Markdown html={body || html} />
        {showWidgets && <Widgets widgets={widgets} />}
      </article>
    </SidebarLayout>
  </Container>
);

const DocPage = ({ data, location }) => {
  const { nav, page, widgets, menu } = data;

  const docsNav = toMenu(menu.siteMetadata.menu.docs, nav);
  const showWidgets = location.pathname.indexOf('/docs/widgets') !== -1;

  return (
    <Layout>
      <Helmet title={page.frontmatter.title} />
      <DocsTemplate
        title={page.frontmatter.title}
        editLinkPath={page.fields.path}
        html={page.html}
        showWidgets={showWidgets}
        widgets={widgets}
        docsNav={docsNav}
        location={location}
        showSidebar
      />
    </Layout>
  );
};

export const pageQuery = graphql`
  query docPage($slug: String!) {
    page: markdownRemark(fields: { slug: { eq: $slug } }) {
      fields {
        path
      }
      frontmatter {
        title
      }
      html
    }
    nav: allMarkdownRemark(
      sort: { fields: [frontmatter___weight], order: ASC }
      filter: {
        frontmatter: { title: { ne: null }, group: { ne: null } }
        fields: { slug: { regex: "/docs/" } }
      }
    ) {
      group(field: frontmatter___group) {
        fieldValue
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              title
              group
            }
            tableOfContents
          }
        }
      }
    }
    menu: site {
      siteMetadata {
        menu {
          docs {
            name
            title
          }
        }
      }
    }
    widgets: allMarkdownRemark(
      sort: { fields: [frontmatter___label], order: ASC }
      filter: { frontmatter: { label: { ne: null } }, fields: { slug: { regex: "/widgets/" } } }
    ) {
      edges {
        node {
          frontmatter {
            title
            label
          }
          html
        }
      }
    }
  }
`;

export default DocPage;
