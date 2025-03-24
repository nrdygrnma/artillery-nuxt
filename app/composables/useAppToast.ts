export const useAppToast = () => {
  const toast = useToast();

  const showToast = (
    title: string,
    description: string,
    color: "success" | "error" | "warning" | "info" | "neutral",
  ) => {
    toast.add({ title, description, color });
  };

  return { showToast };
};
