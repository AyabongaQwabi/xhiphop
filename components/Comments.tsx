'use client';

import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Reply, Heart } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface CommentUser {
  id: string;
  name: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

interface Comment {
  id: string;
  message: string;
  created_time: string;
  from: CommentUser;
  like_count: number;
  comment_count: number;
  replies?: {
    id: string;
    message: string;
    created_time: string;
    from: CommentUser;
    like_count: number;
  }[];
}

interface CommentsProps {
  comments: Comment[];
  videoId: string;
}

// Arrays for generating random names
const firstNames = [
  'Poni',
  'Ngcali',
  'Meck',
  'Cat',
  'Bhokhwe',
  'G',
  'Nigga',
  'Artist',
  'Auty',
  'Medi',
  'Gal',
  'Dyan',
  'Drip',
  'Clown',
  'Poet',
  'Legend',
  'OG',
  'Sweet Chick',
  'Ntwana',
  'Kumkani',
  'Lord',
  'King',
  'Friend',
  'Buddy',
  'Queen',
  'Advisor',
  'General',
  'Chief',
  'Hunk',
  'Crush',
  'Mfene',
  'Ndoni',
  'Soldier',
  'Jahman',
  'Weakling',
  'Comrade',
  'Gweja',
  'Somza',
  'Scam Artist',
  'Sex Champion',
  'Phara',
  'Salesman',
  'MC',
  'Vampire',
  'Billionaire',
  'Big Dawg',
];

const lastNames = [
  'Yam',
  'Yo Moya',
  'Ye Airtime',
  'Ka Makhelwane',
  'Ka Ta Mabibis',
  'Ka Msholozi',
  'Ka Casper',
  'Ka Emtee',
  'Ka Ndulamthi',
  'Yase China',
  'Yamanzi',
  'ene Nkqayi',
  'eBethayo👊',
  'eLilayo😭',
  'eWack😝',
  'eDope😎',
  'eMithiyo👀',
  'eVuthayo🔥',
  'eToo Hot To Handle🔥',
  'ene Boss Moves💪🏽',
  'eneMpandla😌',
  'engena Mazinyo😆',
  'engakwazu Bhala😮',
  'eThakathayo🤯',
  'ka After 9💅',
  'ye Zaka🤑',
  'yo Mdavazo🍆',
  'eNqatyelwayo😭',
  'eneZikhuntyu💰',
  'eNtswampu 🔥',
  'eFamous😁',
  'enama Tshamba🙄',
  'ene Blunt☘️',
  'eSpiti Flames🔥',
  'engu Thixo🙆🏽‍♂️',
  'eStrongo💪🏽',
  'eneNyongo👀',
  'eSuzayo',
  "I'm hot🔥",
  'Eat Me Now 😇',
  'Yase Kapa🌊',
  'Yaqanda🥚',
  'Yesi Gama🙌🏽',
  'Yama Petyu😁',
  'Yoo Noonkala😌',
  'yase Lwandle🌊',
  'eBhityileyo😆',
  'eSexy🤯',
  'eLost 😵‍💫',
  'eyiKhothayo😛',
  'eBroke🫥',
  'eNomsindo🤬',
  'eXokayo🤥',
  'eNyanyekayo🤮',
  'eChilled🤤',
  'eBored🥱',
  'eCute🤗',
  'eKleva😤',
  'eDom🤪',
];

// Function to generate a random name
function pickRandomName(): string {
  const randomFirstName =
    firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName =
    lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${randomFirstName} ${randomLastName}`;
}

// Function to generate a unique avatar URL based on the comment ID
function generateAvatarUrl(commentId: string): string {
  // Use different avatar APIs for variety
  const avatarApis = [
    // Dicebear API with different styles
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${commentId}`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=${commentId}`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${commentId}`,
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${commentId}`,
    `https://api.dicebear.com/7.x/thumbs/svg?seed=${commentId}`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=${commentId}`,
    `https://api.dicebear.com/7.x/open-peeps/svg?seed=${commentId}`,
    `https://api.dicebear.com/7.x/personas/svg?seed=${commentId}`,
  ];

  // Use the comment ID to consistently select the same avatar style for the same comment
  const avatarIndex =
    Math.abs(
      commentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % avatarApis.length;
  return avatarApis[avatarIndex];
}

// Generate a random background color for avatar
function generateAvatarBgColor(commentId: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
    'bg-lime-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-fuchsia-500',
    'bg-rose-500',
    'bg-amber-500',
  ];

  const colorIndex =
    Math.abs(
      commentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % colors.length;
  return colors[colorIndex];
}

function CommentItem({
  comment,
  isReply = false,
}: {
  comment:
    | Comment
    | {
        id: string;
        message: string;
        created_time: string;
        from: CommentUser;
        like_count: number;
      };
  isReply?: boolean;
}) {
  // Generate a consistent avatar URL based on the comment ID
  const avatarUrl = generateAvatarUrl(comment.id);
  const avatarBgColor = generateAvatarBgColor(comment.id);

  // Generate a random name if not provided
  const displayName = comment.from?.name || pickRandomName();

  // Format the time
  const timeAgo = formatDistanceToNow(new Date(comment.created_time), {
    addSuffix: true,
  });

  return (
    <div
      className={`${
        isReply
          ? 'ml-10 mt-3 border-l-2 border-gray-200 pl-4'
          : 'border border-gray-200'
      } 
                    rounded-lg transition-all duration-300 hover:shadow-md bg-white dark:bg-gray-800 overflow-hidden`}
    >
      <div className='p-4'>
        <div className='flex items-start space-x-3'>
          <div
            className={`relative w-12 h-12 overflow-hidden rounded-full ${avatarBgColor} flex items-center justify-center shadow-md`}
          >
            <Image
              src={comment.from?.picture?.data?.url || avatarUrl}
              alt={displayName}
              width={48}
              height={48}
              className='rounded-full object-cover'
            />
          </div>
          <div className='flex-1'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
              <span className='font-bold text-gray-900 dark:text-white'>
                {displayName}
              </span>
              <span className='text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0'>
                {timeAgo}
              </span>
            </div>

            <p className='mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-line'>
              {comment.message}
            </p>

            <div className='flex items-center space-x-4 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700'>
              <div className='flex items-center text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200'>
                <Heart className='w-4 h-4 mr-1' />
                <span className='text-sm font-medium'>
                  {comment.like_count}
                </span>
              </div>

              {!isReply &&
                'comment_count' in comment &&
                comment.comment_count > 0 && (
                  <div className='flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200'>
                    <Reply className='w-4 h-4 mr-1' />
                    <span className='text-sm font-medium'>
                      {comment.comment_count}
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Comments({ comments, videoId }: CommentsProps) {
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (comments && comments.length > 0) {
      setLocalComments(comments);
    } else {
      setLocalComments([]);
    }
  }, [comments]);

  // Show only 3 comments initially, unless expanded
  const displayedComments = isExpanded
    ? localComments
    : localComments.slice(0, 3);

  if (!localComments || localComments.length === 0) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-sm'>
        <MessageCircle className='w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3' />
        <p className='text-gray-500 dark:text-gray-400'>
          No comments yet on this video.
        </p>
        <p className='text-sm text-gray-400 dark:text-gray-500 mt-2'>
          Comments are pulled from Facebook and cannot be added directly.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-5'>
      <div className='flex items-center justify-between'>
        <h3 className='text-xl font-bold flex items-center text-gray-900 dark:text-white'>
          <MessageCircle className='w-5 h-5 mr-2 text-blue-500' />
          Comments{' '}
          <span className='ml-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 py-0.5 px-2 rounded-full'>
            {localComments.length}
          </span>
        </h3>
      </div>

      <p className='text-gray-500 dark:text-gray-400 text-xs italic border-l-2 border-blue-300 pl-2'>
        Comments are pulled from Facebook. Profile pictures are generated
        randomly for privacy.
      </p>

      <div className='space-y-3 mt-4'>
        {displayedComments.map((comment) => (
          <div key={comment.id} className='animate-fadeIn'>
            <CommentItem comment={comment} />
            {comment.replies && comment.replies.length > 0 && (
              <div className='space-y-2 mt-1'>
                {comment.replies.map((reply) => (
                  <div key={reply.id} className='animate-fadeIn'>
                    <CommentItem comment={reply} isReply={true} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {localComments.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='w-full mt-4 py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 
                    text-gray-700 dark:text-gray-200 rounded-md transition-colors duration-200 text-sm font-medium'
        >
          {isExpanded
            ? 'Show Less Comments'
            : `Show All Comments (${localComments.length})`}
        </button>
      )}
    </div>
  );
}
