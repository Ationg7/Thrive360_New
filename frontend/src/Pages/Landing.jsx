import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Landing() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        // Redirect logged-in users to home
        if (isLoggedIn) {
            navigate("/home");
        }
    }, [isLoggedIn, navigate]);

    return (
        <section className="hero d-flex align-items-center justify-content-center text-start p-5">
            <div className="containers">
                <div className="row align-items-center">
                    {/* Left Section - Text */}
                    <div className="col-md-6">
                        <h1 className="Caption text-white"> 
                            Develop your <br />
                            courage to heal, <br />
                            and strength to grow
                        </h1>
                        <button className="btn btn-outline-success mt-3">
    <a href="/signin" className="text-decoration-none text-white">Join now</a>
</button>
                    </div>

                    {/* Right Section - Image */}
                    <div className="col-md-6 text-center position-relative">
    <div className="circle-border"></div>  {/* Dashed border */}
    <div className="circle-spacing"></div>  {/* Space/gap */}
    <div className="circle-bg"></div>       {/* Inner solid circle */}
    <img src="https://www.groupiso.com/wp-content/uploads/2023/02/woman-laughing-on-phone.png" className="hero-img" />
</div>

                </div>
            </div>
        </section>
    );
}

export default Landing;