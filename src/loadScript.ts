export default function (u: string) {
  return new Promise<void>((res) => {
    var d = document,
      s = d.createElement("script")
    s.src = u
    s.async = true
    s.onload = () => res()
    d.head.appendChild(s)
  })
}
