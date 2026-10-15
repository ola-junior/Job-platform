import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/jobs.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const initialForm = { name: '', icon: '', description: '' };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getCategories();
      setCategories(data.data.categories || []);
    } catch { toast.error('Could not load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const createCategory = async event => {
    event.preventDefault();
    setCreating(true);
    try {
      const { data } = await adminService.createCategory(form);
      setCategories(current => [...current, data.data.category].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(initialForm);
      toast.success('Category created');
    } catch (error) { toast.error(error.response?.data?.message || 'Could not create category'); }
    finally { setCreating(false); }
  };

  const deleteCategory = async category => {
    if (!window.confirm(`Delete the ${category.name} category?`)) return;
    setDeletingId(category._id);
    try {
      await adminService.deleteCategory(category._id);
      setCategories(current => current.filter(item => item._id !== category._id));
      toast.success('Category deleted');
    } catch { toast.error('Could not delete category'); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="mt-0.5 text-sm text-slate-500">Manage job listing categories</p>
      </header>
      <form onSubmit={createCategory} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_5rem_2fr_auto] sm:items-end">
        <label className="form-group"><span className="label">Name</span><input className="input" required maxLength={80} value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} /></label>
        <label className="form-group"><span className="label">Icon</span><input className="input" maxLength={8} value={form.icon} onChange={event => setForm(current => ({ ...current, icon: event.target.value }))} /></label>
        <label className="form-group"><span className="label">Description</span><input className="input" maxLength={240} value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} /></label>
        <button type="submit" disabled={creating} className="btn-primary btn-sm"><Plus className="h-4 w-4" /> Add</button>
      </form>
      {loading ? <LoadingSpinner center size="lg" /> : categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Add the first job category above." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {categories.map(category => (
            <div key={category._id} className="flex items-center gap-3 border-b border-slate-100 p-4 last:border-b-0">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-lg">{category.icon || '•'}</span>
              <div className="min-w-0 flex-1"><p className="font-medium text-slate-900">{category.name}</p><p className="truncate text-sm text-slate-500">{category.description || 'No description'} · {category.jobCount || 0} jobs</p></div>
              <button type="button" title={`Delete ${category.name}`} aria-label={`Delete ${category.name}`} disabled={deletingId === category._id} onClick={() => deleteCategory(category)} className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}