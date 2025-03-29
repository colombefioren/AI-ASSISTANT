const BackButton = () => {
  return (
    <>
      <div className="absolute top-10 left-10 z-[100] rounded-full overflow-hidden border border-white cursor-pointer hover:bg-[#ffffff16] transition-colors">
        <div className="p-1 w-16 h-16 text-white flex items-center justify-center text-2xl font-bold">
          ←
        </div>
      </div>
    </>
  );
};
export default BackButton;
