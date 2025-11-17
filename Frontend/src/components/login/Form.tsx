"use client";
import useAuth from "@/hook/useAuth";
import Loader from "./Loader";

const Form = () => {
  const {
    handleInputChange,
    handleSubmit,
    error,
    errorInputEmpty,
    loading,
    formData,
  } = useAuth();

  return (
    <form className="flex flex-col gap-3 mb-6" onSubmit={handleSubmit}>
      <label htmlFor="email">
        <p className="pb-2">Email</p>
        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="admin@testimonialcms.com"
          className="w-96 h-9 px-3 border-gray-600 border rounded-sm"
          onChange={handleInputChange}
        />
      </label>
      <label htmlFor="password">
        <p className="pb-2">Contraseña</p>
        <input
          name="password"
          value={formData.password}
          type="password"
          placeholder="*********"
          autoComplete="false"
          className="w-96 h-9 px-3 border-gray-600 border rounded-sm"
          onChange={handleInputChange}
        />
      </label>
      {loading ? (
        <Loader />
      ) : (
        <button type="submit" className="w-96 h-9 px-3 rounded-sm bg-red-600">
          Iniciar Sesión
        </button>
      )}

      {error && (
        <p className="w-96 text-center p-1 rounded-sm  bg-red-200 text-red-600">
          Email o contraseña incorrecta
        </p>
      )}
      {errorInputEmpty && (
        <p className="w-96 text-center p-1 rounded-sm  bg-red-200 text-red-600">
          {errorInputEmpty}
        </p>
      )}
    </form>
  );
};
export default Form;
