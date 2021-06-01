import { useEffect, useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import styles from './post.module.scss';
import commonStyles from '../../styles/common.module.scss';
import { useUtterances } from '../../hooks/Utterances';

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
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

interface Posts {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostProps {
  post: Post;
  posts: {
    results: Post[];
  };
}

const commentNodeId = 'comments';

export default function Post({ post, posts }: PostProps) {
  const router = useRouter();
  useUtterances(commentNodeId);

  const [postIndex, setPostIndex] = useState<number>();
  const [nextPost, setNextPost] = useState();

  const currentPostTitle = post.data.title;

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

  function editionFormat(last_date: string | null) {
    const lastEditionDate = format(new Date(last_date), 'dd MMM yyyy', {
      locale: ptBR,
    });

    const lastEditionTime = format(new Date(last_date), 'HH:mm', {
      locale: ptBR,
    });

    return `* editado ${lastEditionDate} às ${lastEditionTime}`;
  }

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  function paginationPostsTitle() {
    posts.results.forEach((item, index) => {
      if (item.data.title === currentPostTitle) {
        setPostIndex(index);
      }
    });
  }

  useEffect(() => {
    paginationPostsTitle();
  }, [post]);

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
          <p className={styles.edition}>
            {editionFormat(post.last_publication_date)}
          </p>

          {post.data.content.map(contentData => (
            <div className={styles.bodyContent} key={contentData.heading}>
              <h2>{contentData.heading}</h2>

              {contentData.body.map(text => (
                <p key={text.text}>{text.text}</p>
              ))}
            </div>
          ))}
        </div>
        <div className={styles.footer}>
          <div className={styles.buttonsNavigation}>
            <div>
              {posts.results[postIndex - 1]?.data.title}
              {posts.results[postIndex - 1]?.data.title && (
                <Link href={`/post/${posts.results[postIndex - 1]?.uid}`}>
                  <a>Post anterior</a>
                </Link>
              )}
            </div>

            <div className={styles.next}>
              {posts.results[postIndex + 1]?.data.title}
              {posts.results[postIndex + 1]?.data.title && (
                <Link href={`/post/${posts.results[postIndex + 1]?.uid}`}>
                  <a>Próximo post</a>
                </Link>
              )}
            </div>
          </div>
          <div className={styles.comments} id={commentNodeId} />
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

  const paths = posts.results.map(slug => {
    return {
      params: { slug: slug.uid },
    };
  });

  return {
    fallback: true,
    paths,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const { slug } = params;
  const response = await prismic.getByUID('posts', String(slug), {});

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.author', 'posts.body', 'posts.subtitle'],
    }
  );

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
    last_publication_date: response.last_publication_date,
  };

  return {
    props: {
      post,
      posts,
    },
  };
};
