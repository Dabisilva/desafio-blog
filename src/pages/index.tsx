import { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Header } from '../components/Header';

import styles from '../styles/home.module.scss';
import commonStyles from '../styles/common.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination);

  async function getNextPage() {
    await fetch(postsPagination.next_page)
      .then(response => response.json())
      .then(data => {
        //console.log(data)

        const postsData = data.results.map(post => {
          return {
            uid: post.uid,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
            first_publication_date: format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              {
                locale: ptBR,
              }
            ),
          };
        });

        setPosts({
          next_page: data.next_page,
          results: [...postsPagination.results, ...postsData],
        });
      });
  }

  return (
    <>
      <Head>
        <title>Home | spacetraviling</title>
      </Head>

      <Header />
      <main className={commonStyles.commom}>
        {posts.results.map(post => {
          return (
            <div className={styles.homeContainer} key={post.uid}>
              <Link href={`/post/${post.uid}`}>
                <a>
                  <span>{post.data.title}</span>
                  <p>{post.data.subtitle}</p>

                  <div className={styles.content}>
                    <time>
                      <FiCalendar size={20} />
                      {post.first_publication_date}
                    </time>
                    <p>
                      <FiUser size={20} />
                      {post.data.author}
                    </p>
                  </div>
                </a>
              </Link>
            </div>
          );
        })}

        {posts.next_page && (
          <button
            type="button"
            className={styles.contentButton}
            onClick={getNextPage}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.author', 'posts.body', 'posts.subtitle'],
      pageSize: 1,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  console.log(postsResponse);
  return {
    props: {
      postsPagination,
    },
  };
};
