'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Bold, Italic, Heading1, Heading2, Heading3, 
  List, Quote, Link2, Image as ImageIcon, 
  Copy, Check, UploadCloud, Globe, Eye, Settings, 
  ChevronRight, Save, Trash2, ArrowLeft, Loader2, Plus 
} from 'lucide-react';
import { toast } from 'sonner';
import { createBlogAction, updateBlogAction, BlogInput } from './actions';
import Image from 'next/image';

interface BlogEditorProps {
  initialData?: any; // If editing, otherwise empty
}

// Simple but powerful custom Markdown to HTML compiler
function renderMarkdown(md: string): string {
  if (!md) return '';
  
  let html = md;
  
  // 1. Escaping basic HTML to prevent injection
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  // 2. Code blocks (```code```)
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl my-4 overflow-x-auto text-xs font-mono">${code.trim()}</pre>`;
  });
  
  // 3. Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
  
  // 4. Images (![alt](url))
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl border shadow-md my-4 max-h-[400px] object-cover mx-auto" />');
  
  // 5. Links ([text](url))
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 font-bold underline hover:text-blue-800">$1</a>');
  
  // 6. Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-slate-800">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-extrabold mt-6 mb-3 text-slate-800 border-b pb-1">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black mt-8 mb-4 text-slate-900">$1</h1>');
  
  // 7. Blockquotes (> text)
  html = html.replace(/^\s*&gt;\s?(.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 py-1.5 my-4 bg-blue-50/40 rounded-r-lg italic text-slate-700">$1</blockquote>');
  
  // 8. Bullet lists (- list item)
  // Simple list handling: wrap list items in lists
  html = html.replace(/^\s*-\s(.*$)/gim, '<li class="list-disc ml-6 my-1.5 text-slate-700">$1</li>');
  
  // 9. Bold (**text**)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // 10. Italic (*text*)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // 11. Paragraphs (split by double newlines)
  const lines = html.split(/\n\n+/);
  const formattedLines = lines.map(line => {
    // If it's already a block tag, don't wrap in <p>
    if (
      line.trim().startsWith('<h') || 
      line.trim().startsWith('<pre') || 
      line.trim().startsWith('<blockquote') || 
      line.trim().startsWith('<li') ||
      line.trim().startsWith('<img')
    ) {
      return line;
    }
    return `<p class="my-3 text-slate-700 leading-relaxed font-medium">${line.replace(/\n/g, '<br />')}</p>`;
  });
  
  return formattedLines.join('\n');
}

export function BlogEditor({ initialData }: BlogEditorProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!initialData?.id;

  // Blog Fields State
  const [title, setTitle] = React.useState(initialData?.title || '');
  const [slug, setSlug] = React.useState(initialData?.slug || '');
  const [content, setContent] = React.useState(initialData?.content || '');
  const [excerpt, setExcerpt] = React.useState(initialData?.excerpt || '');
  const [coverImageUrl, setCoverImageUrl] = React.useState(initialData?.cover_image_url || '');
  const [authorName, setAuthorName] = React.useState(initialData?.author_name || 'Clerixs Admin');
  const [category, setCategory] = React.useState(initialData?.category || 'Insights');
  const [tagsInput, setTagsInput] = React.useState(initialData?.tags?.join(', ') || '');
  const [metaTitle, setMetaTitle] = React.useState(initialData?.meta_title || '');
  const [metaDescription, setMetaDescription] = React.useState(initialData?.meta_description || '');
  const [keywordsInput, setKeywordsInput] = React.useState(initialData?.keywords?.join(', ') || '');
  const [isPublished, setIsPublished] = React.useState(initialData?.is_published || false);

  // UI States
  const [activeTab, setActiveTab] = React.useState<'write' | 'preview' | 'both'>('both');
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploadingCover, setIsUploadingCover] = React.useState(false);
  const [isUploadingInline, setIsUploadingInline] = React.useState(false);
  const [copiedUrl, setCopiedUrl] = React.useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = React.useState<string | null>(null);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const inlineInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-generate slug from title
  React.useEffect(() => {
    if (!isEdit && title) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-') // spaces to hyphens
        .replace(/-+/g, '-') // remove double hyphens
        .trim();
      setSlug(generated);
    }
  }, [title, isEdit]);

  // Sync Meta title and description fallback
  React.useEffect(() => {
    if (!metaTitle && title) {
      setMetaTitle(title);
    }
  }, [title, metaTitle]);

  React.useEffect(() => {
    if (!metaDescription && excerpt) {
      setMetaDescription(excerpt);
    }
  }, [excerpt, metaDescription]);

  // Insert formatting markup into textarea
  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = before + (selectedText || 'text') + after;

    setContent(text.substring(0, start) + replacement + text.substring(end));
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selectedText || 'text').length);
    }, 0);
  };

  // Upload Featured/Cover Image
  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploadingCover(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `cover-${Date.now()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath);
      setCoverImageUrl(data.publicUrl);
      toast.success('Cover image uploaded!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to upload cover image.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Upload Inline/Content Image
  const handleInlineUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploadingInline(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `inline-${Date.now()}.${fileExt}`;
      const filePath = `content/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath);
      setUploadedImageUrl(data.publicUrl);
      toast.success('Image uploaded successfully! Copy or insert it.');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to upload image.');
    } finally {
      setIsUploadingInline(false);
    }
  };

  // Copy inline image URL to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Insert Inline Image Markdown into Content
  const insertInlineImageMarkdown = (url: string) => {
    insertFormatting(`![Image description](${url})`, '');
    setUploadedImageUrl(null);
    toast.success('Inserted image markdown into editor!');
  };

  // Save Blog Server Action trigger
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) return toast.error('Title is required.');
    if (!slug) return toast.error('Slug is required.');
    if (!content) return toast.error('Content is required.');
    if (!excerpt) return toast.error('Excerpt is required.');

    try {
      setIsSaving(true);
      const tags = tagsInput.split(',').map((t: string) => t.trim()).filter(Boolean);
      const keywords = keywordsInput.split(',').map((k: string) => k.trim()).filter(Boolean);

      const payload: BlogInput = {
        title,
        slug,
        content,
        excerpt,
        cover_image_url: coverImageUrl,
        author_name: authorName,
        category,
        tags,
        meta_title: metaTitle || title,
        meta_description: metaDescription || excerpt,
        keywords,
        is_published: isPublished,
      };

      const result = isEdit 
        ? await updateBlogAction(initialData.id, payload)
        : await createBlogAction(payload);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? 'Blog post updated!' : 'Blog post created successfully!');
        router.push('/admin/blogs');
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-slate-200">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/admin/blogs')}
            className="h-10 w-10 border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Admin Control</span>
              <ChevronRight size={12} />
              <span>Blogs</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              {isEdit ? 'Edit Blog Post' : 'Create Blog Post'}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/blogs')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-bold text-slate-600 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-bold shadow-md shadow-red-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>{isEdit ? 'Save Changes' : 'Publish Blog'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Editor Area (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Cover Image Upload Area */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Featured Cover Image</h3>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-full md:w-64 aspect-[16/10] bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner group">
                {coverImageUrl ? (
                  <>
                    <Image src={coverImageUrl} alt="Cover Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon size={32} className="text-slate-300 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-slate-400">16:10 Ratio recommended</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                  This image will be displayed at the top of the blog post and as the thumbnail on the marketing blog grid list.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={coverInputRef}
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingCover}
                    onClick={() => coverInputRef.current?.click()}
                    className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {isUploadingCover ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <UploadCloud size={14} />
                    )}
                    Upload Image
                  </button>
                  {coverImageUrl && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(coverImageUrl)}
                      className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl cursor-pointer"
                      title="Copy URL"
                    >
                      <Copy size={14} />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Or paste cover image URL directly..."
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-red-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Markdown Content Editor */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col min-h-[500px]">
            {/* Editor Toolbar */}
            <div className="border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**')}
                  className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  title="Bold"
                >
                  <Bold size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*')}
                  className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  title="Italic"
                >
                  <Italic size={15} />
                </button>
                <div className="h-6 w-px bg-slate-200 mx-1" />
                <button
                  type="button"
                  onClick={() => insertFormatting('# ', '')}
                  className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  title="Heading 1"
                >
                  <Heading1 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('## ', '')}
                  className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  title="Heading 2"
                >
                  <Heading2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('### ', '')}
                  className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  title="Heading 3"
                >
                  <Heading3 size={15} />
                </button>
                <div className="h-6 w-px bg-slate-200 mx-1" />
                <button
                  type="button"
                  onClick={() => insertFormatting('- ', '')}
                  className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  title="Bullet List"
                >
                  <List size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('> ', '')}
                  className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  title="Blockquote"
                >
                  <Quote size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('[text](', ')')}
                  className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  title="Link"
                >
                  <Link2 size={15} />
                </button>
              </div>

              {/* View/Tab Toggles */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'write' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('both')}
                  className={`hidden md:block px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'both' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Split View
                </button>
              </div>
            </div>

            {/* Split Screen Workspace */}
            <div className="flex-1 flex min-h-[400px]">
              
              {/* Writer TextArea */}
              <div 
                className={`flex-1 border-r border-slate-100 p-6 ${
                  activeTab === 'preview' ? 'hidden' : 'block'
                }`}
              >
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article in SEO-friendly Markdown here..."
                  className="w-full h-full min-h-[380px] bg-transparent resize-none border-none outline-none font-mono text-sm leading-relaxed text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Live Preview Display */}
              <div 
                className={`flex-1 p-6 overflow-y-auto bg-slate-50/50 ${
                  activeTab === 'write' ? 'hidden' : 'block'
                }`}
              >
                {content ? (
                  <div 
                    className="prose prose-slate max-w-none prose-headings:font-black prose-p:font-medium prose-a:text-blue-600 prose-blockquote:italic"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400 italic text-sm">
                    Live Preview will appear here as you type...
                  </div>
                )}
              </div>
            </div>

            {/* Inline Image Uploader Helper */}
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50/70 rounded-b-3xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={inlineInputRef}
                  accept="image/*"
                  onChange={handleInlineUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingInline}
                  onClick={() => inlineInputRef.current?.click()}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isUploadingInline ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <UploadCloud size={14} />
                  )}
                  Upload Inline Image
                </button>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Insert inline images inside text</span>
              </div>

              {uploadedImageUrl && (
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 animate-in fade-in duration-300">
                  <div className="relative h-8 w-12 rounded overflow-hidden border">
                    <Image src={uploadedImageUrl} alt="Uploaded inline" fill className="object-cover" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => insertInlineImageMarkdown(uploadedImageUrl)}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Plus size={10} />
                      Insert
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(uploadedImageUrl)}
                      className="p-1.5 border hover:bg-slate-50 rounded-lg text-slate-600 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedUrl === uploadedImageUrl ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadedImageUrl(null)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Settings, Metadata, & SEO (1 col) */}
        <div className="space-y-6">
          
          {/* Main Info */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-3 mb-2 flex items-center gap-2">
              <Settings size={16} className="text-slate-500" />
              <span>Post Settings</span>
            </h3>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Article Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., How Automation Reduces Burnout"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-red-500 transition-all font-semibold text-slate-900"
              />
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Author Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g., Dr. Sarah Jenkins"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-red-500 transition-all font-semibold text-slate-800"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-red-500 transition-all font-semibold text-slate-800"
              >
                <option value="Insights">Insights</option>
                <option value="Technology">Technology</option>
                <option value="Guides">Guides</option>
                <option value="Clinic Growth">Clinic Growth</option>
                <option value="Company News">Company News</option>
              </select>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Short Summary (Excerpt)</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A compelling 1-2 sentence hook describing the article on the feed grid."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:bg-white focus:border-red-500 transition-all font-medium text-slate-600 leading-relaxed min-h-[80px]"
              />
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-4">
              <div>
                <span className="text-sm font-bold text-slate-900 block">Publish Status</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Visible on marketing site</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* SEO Options Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-3 mb-2 flex items-center gap-2">
              <Globe size={16} className="text-slate-500" />
              <span>SEO Optimization</span>
            </h3>

            {/* Slug URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">URL Slug</label>
                <span className="text-[10px] text-slate-400 font-semibold lowercase">/blog/[slug]</span>
              </div>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="slug-with-hyphens"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-red-500 transition-all font-mono text-slate-600"
              />
            </div>

            {/* Meta Title */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Meta Title (Google Tab)</label>
                <span className={`text-[10px] font-bold ${metaTitle.length >= 50 && metaTitle.length <= 60 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {metaTitle.length} chars (Target 50-60)
                </span>
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Google Search title tag"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-red-500 transition-all font-semibold text-slate-800"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Meta Description</label>
                <span className={`text-[10px] font-bold ${metaDescription.length >= 150 && metaDescription.length <= 160 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {metaDescription.length} chars (Target 150-160)
                </span>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="A high click-through summary displayed on search results page."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:bg-white focus:border-red-500 transition-all font-medium text-slate-600 leading-relaxed min-h-[90px]"
              />
            </div>

            {/* Keywords */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Keywords (Comma separated)</label>
              <input
                type="text"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="burnout, emr, automation, clinic growth"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-red-500 transition-all font-semibold text-slate-600"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tags / Categories (Comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="dental, digital, optimization"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-red-500 transition-all font-semibold text-slate-600"
              />
            </div>

          </div>

        </div>

      </div>
    </form>
  );
}
