export default {
  debug: false,
  serve_static_file:false,
  platform: {adapter:{setup: async ()=>({listen: (port: any) => console.log(`running noop platform at ${port}`)})}}
}
