function proxy(name: string, parameters: any[]) {
  return new Promise(function (resolve) {
    fetch(`http://localhost:8000/fapi/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parameters: [...parameters],
      }),
    })
      .then((response) => response.json())
      .then(function (data) {
        resolve(data.result);
      });
  });
}
