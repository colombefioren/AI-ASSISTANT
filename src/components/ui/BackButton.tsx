const BackButton = () => {
  return (
    <div className="absolute top-10 left-10 z-[100] group">
      <div className="relative p-2 rounded-full bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="w-12 h-12 flex items-center justify-center">
          <span className="text-2xl font-bold text-slate-200 group-hover:text-white transition-colors duration-300">
            ←
          </span>
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-500/0 to-blue-500/0 group-hover:from-sky-500/10 group-hover:to-blue-500/10 transition-all duration-300" />
      </div>
    </div>
  );
};

export default BackButton;
