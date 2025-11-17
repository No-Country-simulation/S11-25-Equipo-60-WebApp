const Loader = () => {
  return (
    <>
      <div className="w-fit m-auto">
        <span
          className="
          relative
          inline-block
          w-12 h-12
          rounded-full
          rotate-45
          perspective-[1000px]
          text-white
        ">
          {/* before */}
          <span
            className="
            absolute inset-0
            block
            rounded-full
          "
            style={{
              transform: "rotateX(70deg)",
              animation: "spin 1s linear infinite",
            }}></span>

          {/* after */}
          <span
            className="
            absolute inset-0
            block
            rounded-full
            text-[#FF3D00]
          "
            style={{
              transform: "rotateY(70deg)",
              animation: "spin 1s linear infinite",
              animationDelay: ".4s",
            }}></span>
        </span>

        <style>{`
        @keyframes spin {
          0%, 100% {
            box-shadow: .2em 0px 0 0px currentcolor;
          }
          12% {
            box-shadow: .2em .2em 0 0 currentcolor;
          }
          25% {
            box-shadow: 0 .2em 0 0px currentcolor;
          }
          37% {
            box-shadow: -.2em .2em 0 0 currentcolor;
          }
          50% {
            box-shadow: -.2em 0 0 0 currentcolor;
          }
          62% {
            box-shadow: -.2em -.2em 0 0 currentcolor;
          }
          75% {
            box-shadow: 0px -.2em 0 0 currentcolor;
          }
          87% {
            box-shadow: .2em -.2em 0 0 currentcolor;
          }
        }
      `}</style>
      </div>
    </>
  );
};
export default Loader;
