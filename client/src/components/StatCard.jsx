const StatCard = ({ label, value, icon: Icon, colorClass, gradient }) => (
  <div className={`glass-card group relative overflow-hidden p-6 hover:scale-[1.02] transition-transform duration-300`}>
    <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full ${gradient || 'bg-brand/10'} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
    
    <div className="flex items-center justify-between mb-4">
      <div className={`rounded-xl p-3 border border-white/5 bg-white/5 ${colorClass || 'text-brand'}`}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="h-1.5 w-10 rounded-full bg-white/5" />
    </div>

    <div>
      <p className="text-xs font-black uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-2 font-display text-4xl text-white tracking-widest leading-none">
        {value}
      </p>
    </div>
  </div>
);

export default StatCard;
