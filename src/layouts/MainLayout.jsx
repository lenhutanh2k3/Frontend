import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { Outlet } from "react-router-dom";
const MainLayout = () => {
    return (
        <>
            <Header />
            <main className="mt-15">
                <Outlet />
            </main>
            <Footer />
        </>
    )
}
export default MainLayout;