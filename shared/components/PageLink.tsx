import {useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {ConfirmDialog} from "./ConfirmDialog/ConfirmDialog";

export interface PageLinkProps {
  text: string;
  icon: string;
  route: string;
  currentPage: string;
}

export const PageLink = ({text, icon, route, currentPage}: PageLinkProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const classes = route === currentPage ? "page-link page-link-current" : "page-link";
  return (
    <div className={classes}>
      <Link to={route} onClick={(event) => {
        if (location.search.includes("favorite=") && route !== location.pathname) {
          event.preventDefault();
          setConfirmingDiscard(true);
        }
      }}>
        <img alt={`${text}-icon`} className="page-link-icon" src={icon} width="20" height="20" decoding="async" loading="lazy"/>
        {text}
      </Link>
      {confirmingDiscard &&
        <ConfirmDialog
          tone="neutral"
          title="Discard changes to this favorite?"
          confirmLabel="Discard"
          onConfirm={() => {
            setConfirmingDiscard(false);
            navigate(route);
          }}
          onCancel={() => setConfirmingDiscard(false)}
        />}
    </div>
  );
};
