import { formatDate } from "../date";
import { TaskGroup } from "./TaskGroup";

/** el grupo "Details" de XP: nombre, tipo y después los datos que haya */
export function DetailsGroup({
    name,
    type,
    created,
    modified,
    size,
}: {
    name: string;
    type: string;
    /** YYYY-MM-DD */
    created?: string;
    /** YYYY-MM-DD */
    modified?: string;
    /** ya formateado, ej. "2 KB" */
    size?: string;
}) {
    const rows = [
        created && `Date Created: ${formatDate(created)}`,
        modified && `Date Modified: ${formatDate(modified)}`,
        size && `Size: ${size}`,
    ].filter(Boolean);

    return (
        <TaskGroup title="Details">
            <div className="details">
                <b>{name}</b>
                <span>{type}</span>
                {rows.length > 0 && (
                    <div className="details-gap">
                        {rows.map((row) => (
                            <span key={row}>{row}</span>
                        ))}
                    </div>
                )}
            </div>
        </TaskGroup>
    );
}
