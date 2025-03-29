const BackButton = ({ goBack }: { goBack: () => void }) => {
  return (
    <>
      <div
        onClick={goBack}
        className="absolute top-10 left-10 z-[100] rounded-full overflow-hidden border border-white cursor-pointer hover:bg-[#ffffff16] transition-colors"
      >
        <div className="p-1 w-16 h-16 text-white flex items-center justify-center text-2xl font-bold">
          ←
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-500/0 to-blue-500/0 group-hover:from-sky-500/10 group-hover:to-blue-500/10 transition-all duration-300" />
      </div>
    </>
  );
};

export default BackButton;
