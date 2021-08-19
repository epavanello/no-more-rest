function proxy(address: string, name: string, parameters: IArguments) {
  return new Promise(function (resolve, reject) {
    fetch(`${address}/nmr/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parameters: [...parameters],
      }),
    })
      .then((response) => response.json())
      .then(function (data) {
        resolve(data.result)
      })
      .catch(reject)
  })
}
