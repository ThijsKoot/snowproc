import { Procedure, SnowflakeClient, Rights } from "snowproc";

class DeleteCourse extends Procedure {
    rights = Rights.Owner;

    run = (client: SnowflakeClient, args: { courseName: string }) => {

        const course = client
            .getTable<Course>('course_admin.public.course', Course)
            .find(course => course.courseName === args.courseName);

        for (let user of course.users) {
            client.execute(`drop user ${user}`);
        }

        const ownedItems = (item) => item.owner === course.roleName;

        client.execute('show warehouses in account')
            .filter(ownedItems)
            .forEach(wh => `drop warehouse ${wh.name}`);

        client.execute('show databases in account')
            .filter(ownedItems)
            .forEach(db => `drop database ${db.name}`);

        client.execute(`drop role ${course.roleName}`);

        client.execute(`delete from course_admin.public.course where coursename = '${course.courseName}'`)

        return { deletedCourse: course.courseName, deletedUserCount: course.userCount };
    }
}