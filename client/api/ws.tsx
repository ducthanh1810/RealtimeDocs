export const baseURL = process.env.NEXT_PUBLIC_BASE_WS || "http://localhost/";
export function MyWebSocket(
  document_id?: string,
  user_id?: string,
  token?: string
) {
  const ws = new WebSocket(
    `${baseURL}/${document_id}/${user_id}?token=${token}`
  );
  const push = (data: string) => {
    ws.send(data);
  };
  const subscribe = (
    setData: (data: any) => void,
    setIsMySend: (is: boolean) => void
  ) => {
    ws.onmessage = function (event) {
      try {
        const data = event.data.split("||");
        if (user_id != data[0]) {
          setData(data[1]);
          setIsMySend(false);
        }
      } catch (err) {
        console.log(err);
      }
    };
  };
  const close = () => {
    ws.close();
  };
  return { push, subscribe, close };
}
