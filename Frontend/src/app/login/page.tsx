export default function Login() {
  return (
    <div className="w-full h-dvh grid place-content-center bg-black">
      <div className="w-[450px] h-[711px] p-6 bg-black text-white border-gray-600 border rounded-xl">
        <div className="h-[108px] text-center mb-3 ">
          <h1 className="text-2xl font-bold pb-6">TestimonialesCMS</h1>
          <p className="text-2xl font-semibold">Iniciar Sesión</p>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <form className="flex flex-col gap-3 mb-7">
          <label htmlFor="email">
            <p className="pb-2">Email</p>
            <input
              type="email"
              placeholder="admin@testimonialcms.com"
              className="w-96 h-9 px-3 border-gray-600 border rounded-sm"
            />
          </label>
          <label htmlFor="password">
            <p className="pb-2">Contraseña</p>
            <input
              type="password"
              placeholder="*********"
              className="w-96 h-9 px-3 border-gray-600 border rounded-sm"
            />
          </label>
          <button type="submit" className="w-96 h-9 px-3 rounded-sm bg-red-600">
            Iniciar Sesión
          </button>
        </form>

        <div className="h-9 relative">
          <hr className="w-full absolute top-1/4 border border-gray-700" />
          <p className="w-max text-sm relative m-auto px-2  bg-black">
            Acceso rápido demo
          </p>
        </div>

        <div className="w-full flex justify-between mb-4">
          <button className="w-48 h-9 border border-gray-700">
            Login Admin
          </button>
          <button className="w-48 h-9 border border-gray-700">
            Login Editor
          </button>
        </div>

        <div className="h-36 px-6 py-4 flex flex-col justify-evenly   text-sm rounded-sm text-white  bg-gray-700">
          <p>Cuentas de prueba:</p>
          <p className="text-sm">Admin:</p>
          <p className="text-gray-400">admin@testimoalcms.com / admin123</p>
          <p>Editor</p>
          <p className="text-gray-400">editor@testimonialcms.com / editor123</p>
        </div>

        <div className="h-20 flex flex-col justify-evenly text-sm  text-red-500">
          <button>Crea una nueva cuenta</button>
          <button>Vuelve al inicio</button>
        </div>
      </div>
    </div>
  );
}
