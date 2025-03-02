import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, ThumbsUp, Reply } from 'lucide-react';
import Image from 'next/image';

interface CommentUser {
  id: string;
  name: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

interface Reply {
  id: string;
  message: string;
  created_time: string;
  from: CommentUser;
  likes: number;
}

interface Comment {
  id: string;
  message: string;
  created_time: string;
  from: CommentUser;
  likes: number;
  replies: Reply[];
  replyCount: number;
}

interface CommentsProps {
  comments: Comment[];
}

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

function pickArandomName(): string {
  const randomFirstName =
    firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName =
    lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${randomFirstName} ${randomLastName}`;
}

function CommentItem({
  comment,
  isReply = false,
}: {
  comment: Comment | Reply;
  isReply?: boolean;
}) {
  return (
    <div className={`bg-gray-100 p-4 rounded-lg ${isReply ? 'ml-8 mt-2' : ''}`}>
      <div className='flex items-start space-x-3'>
        <Image
          src={comment.from?.picture?.data?.url || '/logo-white.png'}
          alt={comment.from?.name}
          width={40}
          height={40}
          className='bg-black rounded-full rounded-full'
        />
        <div className='flex-1'>
          <div className='flex items-center justify-between mb-2'>
            <span className='font-semibold text-gray-800'>
              {comment.from?.name || pickArandomName()}
            </span>
          </div>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-500'>
              {formatDistanceToNow(new Date(comment.created_time), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className='text-gray-700'>{comment.message}</p>
          <div className='flex items-center space-x-4 mt-2 text-sm text-gray-500'>
            <div className='flex items-center'>
              <ThumbsUp className='w-4 h-4 mr-1' />
              <span>{comment.like_count}</span>
            </div>
            {!isReply && (
              <div className='flex items-center'>
                <Reply className='w-4 h-4 mr-1' />
                <span>{comment.comment_count}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Comments({ comments }: CommentsProps) {
  if (!comments || comments.length === 0) {
    return <div className='text-gray-500 italic'>No comments yet.</div>;
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold flex items-center'>
        <MessageCircle className='w-5 h-5 mr-2' />
        Comments ({comments.length})
      </h3>
      <ul className='space-y-4'>
        {comments.map((comment) => (
          <li key={comment.id}>
            <CommentItem comment={comment} />
            {/* {comment.replies && comment.replies.length > 0 && (
              <ul className='mt-2 space-y-2'>
                {comment.replies.map((reply) => (
                  <li key={reply.id}>
                    <CommentItem comment={reply} isReply={true} />
                  </li>
                ))}
              </ul>
            )} */}
          </li>
        ))}
      </ul>
    </div>
  );
}
