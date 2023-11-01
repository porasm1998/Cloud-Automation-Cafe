import abc from "../src/images/CAC-Full-Logo-V1.0.jpg";

const Header = () => {
    return (
        <div className="header">
            <img  src={abc} className="img-center" alt="home img" />
        </div>
    )
}

export default Header;
