import { Link } from "react-router-dom";
const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>ArtGuard Platform</h1>
      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/Upload/">Upload</Link>
        <Link to="/MyArt/">MyArt</Link>
      </div>
    </nav>
  );
}

export default Navbar;