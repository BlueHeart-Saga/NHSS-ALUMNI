import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, ThumbsUp, MessageCircle, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { AlumniContextType } from '../../layouts/AlumniLayout';

interface CommunityPost {
  id: string;
  author_name: string;
  author_year: number;
  category: 'General' | 'Tech & AI' | 'Career & Jobs' | 'Entrepreneurship' | 'School Nostalgia';
  title: string;
  content: string;
  likes: number;
  isLiked?: boolean;
  comments: { id: string; author: string; text: string; time: string }[];
  created_at: string;
}

export const AlumniCommunityPage: React.FC = () => {
  const { user } = useOutletContext<AlumniContextType>();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<CommunityPost['category']>('General');
  const [newPostContent, setNewPostContent] = useState('');

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);

  const handleLikePost = (postId: string) => {
    setCommunityPosts(communityPosts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          isLiked: !p.isLiked
        };
      }
      return p;
    }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent) return;
    const post: CommunityPost = {
      id: `p-${Date.now()}`,
      author_name: user?.full_name || 'Alumni Member',
      author_year: user?.passing_year || 2020,
      category: newPostCategory,
      title: newPostTitle,
      content: newPostContent,
      likes: 0,
      isLiked: false,
      comments: [],
      created_at: 'Just now'
    };
    setCommunityPosts([post, ...communityPosts]);
    setShowCreatePostModal(false);
    setNewPostTitle('');
    setNewPostContent('');
    Swal.fire({
      icon: 'success',
      title: 'Post Published!',
      text: 'Your post is now live on the alumni community board.',
      confirmButtonColor: '#111111'
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans text-[#111111]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#111111]">Alumni Community & Forums</h2>
          <p className="text-xs text-[#6B7280]">Share updates, discuss career opportunities, and reconnect with school memories</p>
        </div>
        <button
          onClick={() => setShowCreatePostModal(true)}
          className="w-full sm:w-auto px-5 py-2.5 bg-[#111111] text-white hover:bg-gray-800 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Post</span>
        </button>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {communityPosts.length > 0 ? (
          communityPosts.map(post => (
            <div key={post.id} className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-amber-900 text-sm shrink-0">
                    {post.author_name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#111111]">{post.author_name}</h4>
                    <p className="text-[11px] text-gray-500">Class of {post.author_year} • {post.created_at}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
                  {post.category}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#111111] mb-1">{post.title}</h3>
                <p className="text-xs text-[#374151] leading-relaxed">{post.content}</p>
              </div>

              <div className="flex items-center space-x-6 pt-3 border-t border-[#E5E7EB] text-xs">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center space-x-1.5 font-semibold transition-all ${
                    post.isLiked ? 'text-rose-600' : 'text-gray-500 hover:text-[#111111]'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600' : ''}`} />
                  <span>{post.likes} Likes</span>
                </button>

                <div className="flex items-center space-x-1.5 text-gray-500 font-semibold">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments.length} Comments</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 sm:p-12 bg-white rounded-2xl border border-[#E5E7EB] text-center shadow-sm">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-[#111111]">No Community Posts Yet</h3>
            <p className="text-xs text-[#6B7280] mt-1">Be the first to share an update or start a discussion with fellow alumni.</p>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreatePost} className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-6 space-y-4 shadow-2xl relative text-xs max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={() => setShowCreatePostModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-[#111111]">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-[#111111]">Create Community Discussion</h3>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Topic Category</label>
              <select
                value={newPostCategory}
                onChange={e => setNewPostCategory(e.target.value as any)}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none"
              >
                <option value="General">General</option>
                <option value="Tech & AI">Tech & AI</option>
                <option value="Career & Jobs">Career & Jobs</option>
                <option value="Entrepreneurship">Entrepreneurship</option>
                <option value="School Nostalgia">School Nostalgia</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Post Title</label>
              <input
                type="text"
                required
                value={newPostTitle}
                onChange={e => setNewPostTitle(e.target.value)}
                placeholder="Title of your post..."
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Content</label>
              <textarea
                required
                rows={4}
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
                placeholder="Share your thoughts, job posting, or update..."
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#111111] text-white font-bold rounded-xl shadow-sm hover:bg-gray-800"
            >
              Publish Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
