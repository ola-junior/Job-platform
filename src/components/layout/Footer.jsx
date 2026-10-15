import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Job<span className="text-primary-400">Platform</span></span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">Connecting great talent with great companies. Find your next opportunity today.</p>
          </div>
          {[
            { title: 'For Job Seekers', links: [['Find Jobs', '/jobs'], ['Companies', '/companies'], ['Career Resources', '/about'], ['Saved Jobs', '/saved-jobs']] },
            { title: 'For Employers', links: [['Post a Job', '/employer/jobs/create'], ['Browse Talent', '/admin/users'], ['Pricing', '/about'], ['Employer Dashboard', '/employer/dashboard']] },
            { title: 'Company', links: [['About Us', '/about'], ['Contact', '/contact'], ['Privacy Policy', '#'], ['Terms of Service', '#']] },
          ].map(section => (
            <div key={section.title}>
              <h4 className="font-semibold text-white text-sm mb-4">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map(([label, to]) => (
                  <li key={label}><Link to={to} className="text-sm text-slate-400 hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© {year} JobPlatform. All rights reserved.</p>
          <p className="text-xs text-slate-600">Built for modern recruitment</p>
        </div>
      </div>
    </footer>
  );
}
