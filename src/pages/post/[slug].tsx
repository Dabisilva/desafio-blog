import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { Header } from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import styles from './post.module.scss';
import commonStyles from '../../styles/common.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  function countTimeReadLenght() {
    if (post?.data) {
      let countReadLength = 0;
      post.data.content.map(count => {
        count.body.map(countText => {
          countReadLength =
            countReadLength +
            countText.text.split(' ').length +
            count.heading.split(' ').length;
        });
      });

      let number = countReadLength / 150;

      return Math.round(number) + ' min';
    }
  }

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>Post | {post.uid}</title>
      </Head>

      <Header />

      <img className={styles.image} src={post.data.banner.url} alt="bunner" />

      <main className={commonStyles.commom}>
        <div className={styles.container}>
          <h1>{post.data.title}</h1>

          <div className={styles.headingContent}>
            <time>
              <FiCalendar size={20} />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <p>
              <FiUser size={20} />
              {post.data.author}
            </p>
            <p>
              <FiClock size={20} />
              {countTimeReadLenght()}
            </p>
          </div>

          {post.data.content.map(contentData => (
            <div className={styles.bodyContent} key={contentData.heading}>
              <h2>{contentData.heading}</h2>

              {contentData.body.map(text => (
                <p key={text.text}>{text.text}</p>
              ))}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.author', 'posts.body', 'posts.subtitle'],
      pageSize: 1,
    }
  );

  const paramsReturn = posts.results.map(slug => {
    return {
      params: { slug: slug.uid },
    };
  });

  return {
    fallback: true,
    paths: paramsReturn,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const { slug } = params;
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      subtitle: response.data.subtitle,
      author: response.data.author,
      content: response.data.content,
    },
    first_publication_date: response.first_publication_date,
  };

  return {
    props: {
      post,
    },
  };
};
