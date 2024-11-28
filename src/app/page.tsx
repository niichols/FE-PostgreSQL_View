import ButtonAuth from "@/components/ButtonAuth";

const HomePage = () => {
  return (
    <div>
      <h1 style={{ color:'blue', alignContent: 'center', justifyContent: 'center'}}>Gestion de Biblioteca</h1>
      <ButtonAuth />
      <div style={{ width: 100, height: 100}}>
      <img width={1300} height={600} src="https://umbvirtual.edu.co/wp-content/uploads/2019/02/universidad-manuela-beltran-inovacion-calidad.jpg">
      </img>
      </div>
    </div>
    
  );
};
export default HomePage;
